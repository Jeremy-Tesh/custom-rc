import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import xml2js from 'xml2js';

import { API } from '../../../api/server/api';
import { Users } from '../../../models/server';
import { settings } from '../../../settings';
import CallQueue from '../wallet/callqueue';
import BigBlueButtonApi from '../../../bigbluebutton';
import { sendMessage } from '../../../lib';
import { createRoom } from '../../../lib/server';
import { findDepartments } from '../../../livechat/server/api/lib/departments';
import { hasRole } from '../../../authorization';
import { findAgentDepartments } from '../../../livechat/server/api/lib/agents';

const parser = new xml2js.Parser({
	explicitRoot: true,
});

const parseString = Meteor.wrapAsync(parser.parseString);

const getBBBAPI = () => {
	const url = settings.get('bigbluebutton_server');
	const secret = settings.get('bigbluebutton_sharedSecret');
	const api = new BigBlueButtonApi(`${ url }/bigbluebutton/api`, secret);
	return { api, url };
};

export function sendQueueNotification(depId) {
	const notifQueueList = CallQueue.find({ depId, callback: false, archived: false, startAt: { $exists: false } }, {
		sort: { isVip: -1, requestedAt: 1 } }).fetch();
	if (notifQueueList && notifQueueList.length > 0) {
		const monauser = Users.findOneByUsernameIgnoringCase('mona');
		// sendMessage(monauser, { msg: `${ currUser.username } is ${ volunteerMsg }` }, { _id: monitorroom._id });
		if (monauser) {
			let callCount = 1;
			notifQueueList.forEach((callrecord) => {
				if (callrecord.notify) {
					const queueUser = Users.findOneById(callrecord.customerId);
					const { _id: rid } = createRoom('d', null, null, [monauser, queueUser], null, { }, { creator: monauser._id });
					const message = `Your call queue count is ${ callCount }`;
					sendMessage(monauser, { msg: message }, { _id: rid });
					callCount += 1;
				}
			});
		}
	}
}


export function getCallURL(callQueueId) {
	const callObj = CallQueue.findOne({ _id: callQueueId, archived: false });
	if (callObj) {
		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + callObj._id;
		const confArgsCreateJoin = {
			name: `${ callObj.customerName }'s support call`,
			meetingID,
			attendeePW: 'ap',
			moderatorPW: 'mp',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			meta_html5chat: false,
			meta_html5navbar: false,
			meta_html5autoswaplayout: true,
			meta_html5autosharewebcam: false,
			meta_html5hidepresentation: true,
			record: true,
			allowStartStopRecording: true,
			logoutURL: Meteor.absoluteUrl('home'),
			redirect: true,
		};
		const customValue = settings.get('bigbluebutton_custom_vanity'); // default
		if (customValue && customValue.length > 0) {
			const customValueArr = customValue.split('\n');
			for (let i = 0; i < customValueArr.length; i++) {
				if (!customValueArr[i].startsWith('prospect_')) {
					const keyValuePair = customValueArr[i].split('=');
					if (keyValuePair.length > 1) {
						confArgsCreateJoin[keyValuePair[0]] = keyValuePair[1];
					}
				}
			}
		}
		const createUrl = api.urlFor('create', confArgsCreateJoin);
		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);
		if (doc.response.returncode[0]) {
			// const user = Users.findOneById(this.userId);

			const hookApi = api.urlFor('hooks/create', {
				meetingID,
				callbackURL: Meteor.absoluteUrl(`api/v1/supportcall.userleft/${ meetingID }`),
				// callbackURL: `https://bbd4a279784f.ngrok.io/api/v1/supportcall.userleft/${ meetingID }`,
				logoutURL: Meteor.absoluteUrl('home'),
			});

			const hookResult = HTTP.get(hookApi);

			if (hookResult.statusCode !== 200) {
				// TODO improve error logging
				console.log({ hookResult });
				return;
			}
			const confArgsJoin = {
				password: 'mp', // mp if moderator ap if attendee
				meetingID,
				attendeePW: true,
				fullName: Meteor.user().name,
				userID: Meteor.userId(),
				joinViaHtml5: true,
				avatarURL: Meteor.absoluteUrl(`avatar/${ Meteor.user().username }`),
			};

			if (customValue && customValue.length > 0) {
				const customValueArr = customValue.split('\n');
				for (let i = 0; i < customValueArr.length; i++) {
					const keyValuePair = customValueArr[i].split('=');
					if (keyValuePair.length > 1) {
						confArgsJoin[keyValuePair[0]] = keyValuePair[1];
					}
				}
			}
			// return API.v1.success({url: api.urlFor('join', confArgsJoin)});
			return api.urlFor('join', confArgsJoin);
		}
	}
	return undefined;
}


API.v1.addRoute('supportcall/requestCall', { authRequired: true }, {
	post() {
		const customerId = this.userId;
		const { depId } = this.bodyParams;
		if (!depId) {
			return API.v1.failure('Department ID is missing');
		}
		const existingCallCount = CallQueue.find({ customerId, depId, archived: false }).count();
		if (existingCallCount < 1) {
			const user = Users.findOneById(customerId, {
				fields: {
					username: 1,
				},
			});
			const uid = Meteor.userId();
			const isVip = hasRole(uid, ['vip']);

			CallQueue.insert({
				customerName: user.username,
				customerId,
				depId,
				isVip,
			});
		}
		const queueList = CallQueue.find({ depId, archived: false }, {
			sort: { isVip: -1, requestedAt: 1 } }).fetch();
		let callCount = 1;
		let recordPresent = false;
		let url;
		let callbackOption = false;
		if (queueList && queueList.length) {
			queueList.forEach((callrecord) => {
				if (callrecord.customerId === this.userId && callrecord.depId === depId) {
					recordPresent = true;
					if (callrecord.startAt) {
						callCount = 0;
						url = getCallURL(callrecord._id);
					}
					if (callrecord.callback) {
						callCount = 0;
						callbackOption = callrecord.callback;
					}
					// break; cant break for each
				}
				if (!recordPresent && !callrecord.callback) {
					callCount += 1;
				}
			});
		}
		if (recordPresent) {
			return API.v1.success({
				queue: callCount,
				callback: callbackOption,
				url,
			});
		}
		return API.v1.success({
			queue: -1,
		});
	},
});
API.v1.addRoute('supportcall.userleft/:id', { authRequired: false }, {
	post() {
		// TODO check checksum
		const event = JSON.parse(this.bodyParams.event)[0];
		const eventType = event.data.id;
		const tmeetingID = event.data.attributes.meeting['external-meeting-id'];
		const agentId = event.data.attributes.user['external-user-id'];
		const rid = tmeetingID.replace(settings.get('uniqueID'), '');
		if (eventType === 'user-left') {
			const existingCall = CallQueue.findOne({ agentId, archived: false });
			if (existingCall) {
				const { api } = getBBBAPI();
				const meetingID = settings.get('uniqueID') + rid;
				const endApi = api.urlFor('end', {
					meetingID,
					password: 'mp', // mp if moderator ap if attendee
				});
				HTTP.get(endApi);
				// const endApiResult = HTTP.get(endApi);
				CallQueue.update({
					_id: existingCall._id,
				}, {
					$set: {
						endAt: new Date(),
						archived: true,
					},
				});
				sendQueueNotification(existingCall.depId);
			}
		}
	},
});

API.v1.addRoute('supportcall/allDeptStatus', { authRequired: true }, {
	get() {
		const customerId = this.userId;
		// const { offset, count } = this.getPaginationItems();
		const sort = { name: 1 };
		const offset = 0;
		const count = 50;
		const departments = Promise.await(findDepartments({
			userId: this.userId,
			enabled: true,
			pagination: {
				offset,
				count,
				sort,
			},
		}));
		const result = [];
		if (departments && departments.departments) {
			departments.departments.forEach((department) => {
				const depId = department._id;
				const valueObj = {};
				valueObj._id = depId;
				valueObj.name = department.name;
				valueObj.description = department.description;
				const queueList = CallQueue.find({ depId, archived: false }, {
					sort: { isVip: -1, requestedAt: 1 } }).fetch();
				let callCount = 1;
				let recordPresent = false;
				let url;
				let callbackOption = false;
				if (queueList && queueList.length) {
					queueList.forEach((callrecord) => {
						if (callrecord.customerId === this.userId && callrecord.depId === depId) {
							recordPresent = true;
							if (callrecord.startAt) {
								callCount = 0;
								url = getCallURL(callrecord._id);
							}
							if (callrecord.callback) {
								callCount = 0;
								callbackOption = callrecord.callback;
							}
							// break; cant break for each
						}
						if (!recordPresent && !callrecord.callback) {
							callCount += 1;
						}
					});
				}
				if (recordPresent) {
					valueObj.queue = callCount;
					valueObj.callback = callbackOption;
					valueObj.url = url;
				} else {
					valueObj.queue = -1;
				}
				result.push(valueObj);
			});
		}
		return API.v1.success({
			result,
		});
	},
});


API.v1.addRoute('supportcall/statusCall', { authRequired: true }, {
	get() {
		const customerId = this.userId;
		const { departmentId } = this.requestParams();
		const depId = departmentId;
		const existingCallCount = CallQueue.find({ customerId, depId, archived: false }).count();
		if (existingCallCount < 1) {
			return API.v1.success({
				queue: -1,
			});
		}
		const queueList = CallQueue.find({ depId, archived: false }, {
			sort: { isVip: -1, requestedAt: 1 } }).fetch();
		let callCount = 1;
		let recordPresent = false;
		let url;
		let callbackOption = false;
		if (queueList && queueList.length) {
			queueList.forEach((callrecord) => {
				if (callrecord.customerId === this.userId && callrecord.depId === depId) {
					recordPresent = true;
					if (callrecord.startAt) {
						callCount = 0;
						url = getCallURL(callrecord._id);
						callbackOption = callrecord.callback;
					}
					if (callrecord.callback) {
						callCount = 0;
						callbackOption = callrecord.callback;
					}
					// break; cant break for each
				}
				if (!recordPresent && !callrecord.callback) {
					callCount += 1;
				}
			});
		}
		if (recordPresent) {
			return API.v1.success({
				queue: callCount,
				callback: callbackOption,
				url,
			});
		}
	},
});
API.v1.addRoute('supportcall/updateCall', { authRequired: true }, {
	put() {
		const customerId = this.userId;
		const { callId, rating, feedback } = this.bodyParams;
		if (!callId) {
			return API.v1.failure(' ID is missing');
		}
		const existingCall = CallQueue.findOne({ _id: callId });
		if (existingCall) {
			CallQueue.update({
				_id: existingCall._id,
			}, {
				$set: {
					rating,
					feedback,
					feedbackAt: new Date(),
					feedbackBy: customerId,
				},
			});
			sendQueueNotification(existingCall.depId);
		}
		return API.v1.success('');
	},
	post() {
		console.log('body param ', this.bodyParams);
		const customerId = this.userId;
		const { callId, rating, feedback } = this.bodyParams;
		if (!callId) {
			return API.v1.failure(' ID is missing');
		}
		const existingCall = CallQueue.findOne({ _id: callId });
		if (existingCall) {
			CallQueue.update({
				_id: existingCall._id,
			}, {
				$set: {
					rating,
					feedback,
					feedbackAt: new Date(),
					feedbackBy: customerId,
				},
			});
			sendQueueNotification(existingCall.depId);
		}
		return API.v1.success('');
	},
});
API.v1.addRoute('supportcall/cancelCall', { authRequired: true }, {
	put() {
		const customerId = this.userId;
		const { depId } = this.bodyParams;
		if (!depId) {
			return API.v1.failure('Department ID is missing');
		}
		const existingCall = CallQueue.findOne({ customerId, depId, archived: false });
		if (existingCall) {
			CallQueue.update({
				_id: existingCall._id,
			}, {
				$set: {
					archived: true,
					cancelledAt: new Date(),
				},
			});
			sendQueueNotification(existingCall.depId);
		}
		return API.v1.success('');
	},
	post() {
		const customerId = this.userId;
		const { depId } = this.bodyParams;
		if (!depId) {
			return API.v1.failure('Department ID is missing');
		}
		const existingCall = CallQueue.findOne({ customerId, depId, archived: false });
		if (existingCall) {
			CallQueue.update({
				_id: existingCall._id,
			}, {
				$set: {
					archived: true,
					cancelledAt: new Date(),
				},
			});
			sendQueueNotification(existingCall.depId);
		}
		return API.v1.success('');
	},

});

API.v1.addRoute('supportcall/callback', { authRequired: true }, {
	put() {
		const customerId = this.userId;
		const { depId } = this.bodyParams;
		if (!depId) {
			return API.v1.failure('Department ID is missing');
		}
		const existingCall = CallQueue.findOne({ customerId, depId, archived: false });
		if (existingCall) {
			CallQueue.update({
				_id: existingCall._id,
			}, {
				$set: {
					callback: true,
				},
			});
			sendQueueNotification(existingCall.depId);
		}

		return API.v1.success('');
	},
});

API.v1.addRoute('supportcall/notify', { authRequired: true }, {
	put() {
		const customerId = this.userId;
		const { depId } = this.bodyParams;
		if (!depId) {
			return API.v1.failure('Department ID is missing');
		}
		const existingCall = CallQueue.findOne({ customerId, depId, archived: false });
		if (existingCall) {
			CallQueue.update({
				_id: existingCall._id,
			}, {
				$set: {
					notify: true,
				},
			});
		}
		return API.v1.success('');
	},
});

API.v1.addRoute('supportcall/queuelist', { authRequired: true }, {
	get() {
		const queueList = CallQueue.find({ archived: false }, {
			sort: { isVip: -1, requestedAt: 1 } }).fetch();
		return API.v1.success(queueList);
	},
});

API.v1.addRoute('supportcall/callendedlist', { authRequired: true }, {
	get() {
		const endedcalls = CallQueue.find({ archived: true, endAt: { $exists: true } }, {
			sort: { startAt: 1 }, limit: 25 }).fetch();
		return API.v1.success(endedcalls);
	},
});

API.v1.addRoute('supportcall/getRecord', { authRequired: true }, {
	get() {
		const { callQueueId } = this.requestParams();
		const meetingID1 = settings.get('uniqueID') + callQueueId;
		const { api } = getBBBAPI();
		const meetingID = 'x576AmeTh9uCDwrD3Gmi7P6JGjkCBuMG8G';
		const getRecordUrl = api.urlFor('getRecordings', { meetingID });
		const recordResult = HTTP.get(getRecordUrl);
		console.log('ezhil ', recordResult, meetingID);

		const createUrl = api.urlFor('getRecordings', {});
		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);
		// console.log('ezhil doc', doc.response.recordings[0].recording);

		return API.v1.success(recordResult);
	},
});

API.v1.addRoute('supportcall/agentqueue', { authRequired: true }, {
	get() {
		// const { api } = getBBBAPI();
		// const createUrl = api.urlFor('getRecordings', {});
		// const createResult = HTTP.get(createUrl);
		// const doc = parseString(createResult.content);
		// console.log('ezhil doc', doc.response.recordings[0].recording);

		const { offset, count } = this.getPaginationItems();
		// const { sort } = this.parseJsonQuery();
		const { departmentId } = this.requestParams();
		const uid = Meteor.userId();
		const isManager = hasRole(uid, ['livechat-manager']);
		if (isManager) {
			const queueList = CallQueue.find({ depId: departmentId, archived: false }, {
				sort: { isVip: -1, requestedAt: 1 } }).fetch();
			return API.v1.success(queueList);
		}

		let queueList = CallQueue.find({ agentId: uid, archived: false, assignedAgent: uid, assignedAt: { $gte: new Date(Date.now() - 5000) } }, {
			sort: { isVip: -1, requestedAt: 1 }, limit: 1 }).fetch();
		if (queueList && queueList.length > 0) {
			return API.v1.success(queueList);
		}
		queueList = CallQueue.find({ agentId: uid, archived: false, assignedAt: { $lte: new Date(Date.now() - 5000) } }, {
			sort: { isVip: -1, requestedAt: 1 }, limit: 1 }).fetch();
		if (queueList && queueList.length > 0) {
			CallQueue.update({
				_id: queueList[0]._id,
			}, {
				$set: {
					assignedAgent: uid,
					assignedAt: new Date(),
				},
			});
			sendQueueNotification(queueList[0].depId);
			return API.v1.success(queueList);
		}

		queueList = CallQueue.find({ agentId: uid, archived: false }, {
			sort: { isVip: -1, requestedAt: 1 }, limit: 1 }).fetch();
		if (queueList && queueList.length > 0) {
			CallQueue.update({
				_id: queueList[0]._id,
			}, {
				$set: {
					assignedAgent: uid,
					assignedAt: new Date(),
				},
			});
			sendQueueNotification(queueList[0].depId);
			return API.v1.success(queueList);
		}
		// const departments = Promise.await(findAgentDepartments({
		// 	userId: uid,
		// 	enabledDepartmentsOnly: true,
		// 	agentId: uid,
		// }));
		// const agentDepartments = departments.map((dept) => dept.departmentId);
		// console.log('ezhil agentDepartments', agentDepartments);
		queueList = CallQueue.find({ depId: departmentId, archived: false }, {
			sort: { isVip: -1, requestedAt: 1 }, limit: 1 }).fetch();
		return API.v1.success(queueList);
	},
});

API.v1.addRoute('supportcall/startcall', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// // const { sort } = this.parseJsonQuery();
		const agentId = this.userId;
		const { callQueueId } = this.requestParams();
		// console.log(callQueueId, agentId);
		// const existingCall = CallQueue.findOne({ customerId, depId, archived: false });
		const queueList = CallQueue.findOne({ _id: callQueueId, archived: false }, {
			sort: { isVip: -1, requestedAt: 1 } });
		if (queueList) {
			CallQueue.update({
				_id: callQueueId,
			}, {
				$set: {
					agentId,
					startAt: new Date(),
					callURL: getCallURL(callQueueId),
				},
			});
			sendQueueNotification(queueList.depId);
		}


		return API.v1.success('');
	},

});

API.v1.addRoute('supportcall/endcall', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// // const { sort } = this.parseJsonQuery();
		const agentId = this.userId;
		const { callQueueId } = this.requestParams();
		// console.log(callQueueId, agentId);
		const queueList = CallQueue.find({ _id: callQueueId, archived: false }, {
			sort: { isVip: -1, requestedAt: 1 } }).fetch();
		// console.log('ezhil endcall', queueList);
		if (queueList) {
			CallQueue.update({
				_id: callQueueId,
			}, {
				$set: {
					endAt: new Date(),
					archived: true,
				},
			});
		}
		// to send room url
		return API.v1.success('');
	},

});

API.v1.addRoute('supportcall/callurl', { authRequired: true }, {
	get() {
		// const { offset, count } = this.getPaginationItems();
		// // const { sort } = this.parseJsonQuery();
		const agentId = this.userId;
		const { callQueueId } = this.requestParams();
		// to send room url
		return API.v1.success({ url: getCallURL(callQueueId) });
		// return API.v1.success('');
	},
});
