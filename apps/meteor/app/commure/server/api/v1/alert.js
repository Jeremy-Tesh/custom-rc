import { Meteor } from 'meteor/meteor';
import _ from 'underscore';

import { Rooms, Subscriptions, Users } from '../../../../models/server';
import { API } from '../../../../api/server';
import { canAccessRoom, hasPermission, roomAccessAttributes } from '../../../../authorization/server';
import { settings } from '../../../../settings/server';
import { sendNotification } from '../../../../lib/server';
import { findUsersOfRoom } from '../../../../../server/lib/findUsersOfRoom';

export function findPrivateGroupByIdOrName({ params, userId, checkedArchived = true }) {
	if ((!params.roomId || !params.roomId.trim()) && (!params.roomName || !params.roomName.trim())) {
		throw new Meteor.Error('error-room-param-not-provided', 'The parameter "roomId" or "roomName" is required');
	}

	const roomOptions = {
		fields: {
			...roomAccessAttributes,
			t: 1,
			ro: 1,
			name: 1,
			fname: 1,
			prid: 1,
			archived: 1,
			broadcast: 1,
		},
	};
	const room = params.roomId ? Rooms.findOneById(params.roomId, roomOptions) : Rooms.findOneByName(params.roomName, roomOptions);

	if (!room || room.t !== 'p') {
		throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
	}

	const user = Users.findOneById(userId, { fields: { username: 1 } });

	if (!canAccessRoom(room, user)) {
		throw new Meteor.Error('error-room-not-found', 'The required "roomId" or "roomName" param provided does not match any group');
	}

	// discussions have their names saved on `fname` property
	const roomName = room.prid ? room.fname : room.name;

	if (checkedArchived && room.archived) {
		throw new Meteor.Error('error-room-archived', `The private group, ${roomName}, is archived`);
	}

	const sub = Subscriptions.findOneByRoomIdAndUserId(room._id, userId, { fields: { open: 1 } });

	return {
		rid: room._id,
		open: sub && sub.open,
		ro: room.ro,
		t: room.t,
		name: roomName,
		broadcast: room.broadcast,
	};
}

API.v1.addRoute(
	'groups.createAlertGroup',
	{ authRequired: true },
	{
		async post() {
			if (!hasPermission(this.userId, 'create-p')) {
				return API.v1.unauthorized();
			}

			if (!this.bodyParams.name) {
				return API.v1.failure('Body param "name" is required');
			}

			if (this.bodyParams.members && !_.isArray(this.bodyParams.members)) {
				return API.v1.failure('Body param "members" must be an array if provided');
			}

			if (this.bodyParams.customFields && !(typeof this.bodyParams.customFields === 'object')) {
				return API.v1.failure('Body param "customFields" must be an object if provided');
			}
			if (this.bodyParams.extraData && !(typeof this.bodyParams.extraData === 'object')) {
				return API.v1.failure('Body param "extraData" must be an object if provided');
			}

			const readOnly = typeof this.bodyParams.readOnly !== 'undefined' ? this.bodyParams.readOnly : false;

			let id;

			Meteor.runAsUser(this.userId, () => {
				id = Meteor.call(
					'createPrivateGroup',
					this.bodyParams.name,
					this.bodyParams.members ? this.bodyParams.members : [],
					readOnly,
					this.bodyParams.customFields,
					this.bodyParams.extraData,
				);
			});
			const notifyUsers = settings.get('Alert_Notification');
			if (notifyUsers) {
				const receiver = this.bodyParams.members.map((username) =>
					username.indexOf('@') !== -1 ? Meteor.users.findOne({ 'emails.address': username }) : Meteor.users.findOne({ username }),
				);
				const commuresender = {
					_id: 'mona',
					status: 'online',
					active: true,
					username: this.bodyParams.sender_name ? this.bodyParams.sender_name : 'Alert',
				};
				const location = this.bodyParams.location ? this.bodyParams.location : '';
				const alertMsg = `${commuresender.username} ${settings.get('Alert_Message')} ${location}`;
				const subject = `${commuresender.username} created an alert`;

				if (receiver.length) {
					// eslint-disable-next-line array-callback-return
					for (const user of receiver) {
						if (user._id) {
							const room = Rooms.findOneById(id.rid, {
								_id: 1,
								v: 1,
								serverBy: 1,
								open: 1,
								departmentId: 1,
							});
							// eslint-disable-next-line no-await-in-loop
							await sendNotification({
								subscription: {
									id: id._id,
									rid: id.rid,
									t: 'p',
									u: {
										_id: user._id,
									},
									name: room.u.username,
									receiver: [user],
								},
								sender: commuresender,
								message: {
									id: id.rid,
									rid: id.rid,
									msg: alertMsg,
									u: commuresender,
									urls: [],
									mentions: [],
									subject,
								},
								hasMentionToAll: true,
								hasMentionToHere: false,
								notificationMessage: alertMsg,
								hasReplyToThread: false,
								room: Object.assign(room, { name: 'Alert' }),
								mentionIds: [],
								disableAllMessageNotifications: false,
								customFields: user.customFields,
								alertOrigin: 'create',
							});
						}
					}
				}
			}

			return API.v1.success({
				group: this.composeRoomWithLastMessage(Rooms.findOneById(id.rid, { fields: API.v1.defaultFieldsToExclude }), this.userId),
			});
		},
	},
);
API.v1.addRoute(
	'groups.notifySecurityDispatch',
	{ authRequired: true },
	{
		async post() {
			const findResult = findPrivateGroupByIdOrName({
				params: this.requestParams(),
				userId: this.userId,
				checkedArchived: false,
			});

			const notifyUsers = settings.get('Alert_Notification');

			const { cursor, totalCount } = findUsersOfRoom({
				rid: findResult?.rid,
			});

			const [members] = await Promise.all([cursor.toArray(), totalCount]);

			if (notifyUsers) {
				const receiver = members.map((usr) => {
					const { username } = usr;
					return Meteor.users.findOne({ username });
				});
				const commuresender = {
					_id: 'mona',
					status: 'online',
					active: true,
					username: this.bodyParams.sender_name ? this.bodyParams.sender_name : 'Alert',
				};
				const location = this.bodyParams.location ? this.bodyParams.location : '';
				const alertMsg = `${settings.get('Alert_Security_Dispatch_Message')} ${location}`;
				const subject = `Security team dispatched to ${location}`;

				if (receiver.length) {
					// eslint-disable-next-line array-callback-return
					for (const user of receiver) {
						if (user._id) {
							const room = Rooms.findOneById(findResult?.rid, {
								_id: 1,
								v: 1,
								serverBy: 1,
								open: 1,
								departmentId: 1,
							});
							// eslint-disable-next-line no-await-in-loop
							await sendNotification({
								subscription: {
									id: findResult._id,
									rid: findResult.rid,
									t: findResult.t,
									u: {
										_id: user._id,
									},
									name: room.u.username,
									receiver: [user],
								},
								sender: commuresender,
								message: {
									// id: id.rid,
									// rid: id.rid,
									msg: alertMsg,
									u: commuresender,
									urls: [],
									mentions: [],
									subject,
								},
								hasMentionToAll: true,
								hasMentionToHere: false,
								notificationMessage: alertMsg,
								hasReplyToThread: false,
								room: Object.assign(room, { name: 'Alert' }),
								mentionIds: [],
								disableAllMessageNotifications: false,
								customFields: user.customFields,
								alertOrigin: 'dispatch',
							});
						}
					}
				}
			}

			return API.v1.success();
		},
	},
);

API.v1.addRoute(
	'groups.notifyCancel',
	{ authRequired: true },
	{
		async post() {
			const findResult = findPrivateGroupByIdOrName({
				params: this.requestParams(),
				userId: this.userId,
				checkedArchived: false,
			});

			const notifyUsers = settings.get('Alert_Notification');

			const { cursor, totalCount } = findUsersOfRoom({
				rid: findResult?.rid,
			});

			const [members] = await Promise.all([cursor.toArray(), totalCount]);

			if (notifyUsers) {
				const receiver = members.map((usr) => {
					const { username } = usr;
					return Meteor.users.findOne({ username });
				});
				const commuresender = {
					_id: 'mona',
					status: 'online',
					active: true,
					username: this.bodyParams.sender_name ? this.bodyParams.sender_name : 'Alert',
				};
				const location = this.bodyParams.location ? this.bodyParams.location : '';
				const alertMsg = `${commuresender.username} ${settings.get('Alert_Cancel_Message')} ${location}`;
				const subject = `${commuresender.username} canceled the alert`;
				if (receiver.length) {
					for (const user of receiver) {
						if (user._id) {
							const room = Rooms.findOneById(findResult?.rid, {
								_id: 1,
								v: 1,
								serverBy: 1,
								open: 1,
								departmentId: 1,
							});
							// eslint-disable-next-line no-await-in-loop
							await sendNotification({
								subscription: {
									id: findResult._id,
									rid: findResult.rid,
									t: findResult.t,
									u: {
										_id: user._id,
									},
									name: room.u.username,
									receiver: [user],
								},
								sender: commuresender,
								message: {
									// id: id.rid,
									// rid: id.rid,
									msg: alertMsg,
									u: commuresender,
									urls: [],
									mentions: [],
									subject,
								},
								hasMentionToAll: true,
								hasMentionToHere: false,
								notificationMessage: alertMsg,
								hasReplyToThread: false,
								room: Object.assign(room, { name: 'Alert' }),
								mentionIds: [],
								disableAllMessageNotifications: false,
								customFields: user.customFields,
								alertOrigin: 'cancel',
							});
						}
					}
				}
			}

			return API.v1.success();
		},
	},
);

API.v1.addRoute(
	'groups.alertStatus',
	{ authRequired: true },
	{
		get() {
			const findResult = findPrivateGroupByIdOrName({
				params: this.requestParams(),
				userId: this.userId,
				checkedArchived: false,
			});
			const room = Rooms.findOneById(findResult.rid, { fields: API.v1.defaultFieldsToExclude });

			const alert = room?.customFields?.alert;

			return API.v1.success({
				status: alert,
			});
		},
	},
);
