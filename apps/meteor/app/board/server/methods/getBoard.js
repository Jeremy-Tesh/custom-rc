import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import moment from 'moment';

import Board from '../models/boards';
import CustomFields from '../models/customFields';
import { handleError } from '../../../utils';
import Integrations from '../models/integrations';
import { Rooms, Subscriptions, Users } from '../../../models';
import { settings } from '../../../settings';
import { createRoom } from '../../../lib/server';
import Lists from '../models/lists';
import Cards from '../models/cards';
// import { Mailer } from '../lib/Mailer';
import * as Mailer from '../../../mailer';

Meteor.methods({
	'board:getByRoom': (rid) => {
		check(rid, String);
		// if (!Meteor.userId()) {
		// 	throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'board:getByRoom' });
		// }
		const isGoal = rid.endsWith('-goals');
		let roomid = rid.replace('-goals', '');
		if(rid.split('::-::').length>1){
			roomid = rid.split('::-::')[0];
		}
		const room = Rooms.findOneById(roomid);
		let bdtitle = room.t !== 'd' ? room.name : room.usernames.join('-');
		if(rid.split('::-::').length>1){
			bdtitle = rid.replace(rid.split('::-::')[0],bdtitle);
		}
		// const perm = room.t !== 'c' ? 'public' : 'private' ;
		const perm = 'public';
		let isSelfBoard = false;
		if (isGoal) {
			bdtitle += '-goals';
			isSelfBoard = true;
		} else {
			isSelfBoard = room.t === 'd' && room.usersCount === 1;
		}
		const boardObj = Board.findOne({ title: bdtitle });
		let id = null;

		const subscriptions = Subscriptions.findByRoomIdWhenUsernameExists(roomid, { fields: { 'u._id': 1, 'u.username': 1, 'u.name': 1 } }).fetch();
		// const userIds = subscriptions.map((s) => s.u._id); // TODO: CACHE: expensive
		const subscribedUsername = subscriptions.map((s) => s.u.username); // TODO: CACHE: expensive
		if (!boardObj) {
			const bdMembers = [];
			const usernames = subscribedUsername;
			usernames.forEach((name) => {
				const user = Meteor.users.findOne({ username: name });
				if (user && user._id) {
					bdMembers.push({
						userId: user._id,
						isAdmin: true,
						isActive: true,
						isCommentOnly: false,
					});
				}
			});
			id = Board.insert({
				title: bdtitle,
				members: bdMembers,
				permission: perm,
				color: 'belize',
				view: 'board-view-lists',
				allowsAssignee: false,
				allowsMembers: !isSelfBoard,
				allowsRequestedBy: false,
				allowsAssignedBy: false,
				allowsReceivedDate: false,
				allowsDueDate: false,
			});
			let listsSetting = settings.get('Board_Mapping');
			if (isGoal) {
				listsSetting = '2020,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec';
			}
			if (listsSetting.length > 0) {
				const listsValues = listsSetting.split(',');
				for (let i = 0; i < listsValues.length; i++) {
					const listName = listsValues[i].trim();
					Lists.insert({
						title: listName,
						boardId: id,
					});
				}
			}
			const cfSetting = settings.get('Board_Custom_Fields');
			if (cfSetting.length > 0) {
				const cfValues = cfSetting.split(',');
				let boardIds = [];
				boardIds.push(id);
				for (let i = 0; i < cfValues.length; i++) {
					const cfName = cfValues[i].trim();
					CustomFields.insert({
						boardIds,
						name: cfName,
						type: 'text',
						settings: {},
						showOnCard: true,
					});
				}
			}
			if (room.t !== 'd' && rid.indexOf('::-::') === -1) {
				const integration = {
					enabled: true,
					username: 'mona',
					channel: `#${ bdtitle }`,
					alias: undefined,
					// emoji: ':card_index:',
					avatar: undefined,
					name: bdtitle,
					script: 'class Script {\n  /**\n   * @params {object} request\n   */\n  process_incoming_request({ request }) {\n    var contentTxt = request.content.text;\n    var brIdx =  contentTxt.indexOf("\\nhttp");\n    var trimmedContent = brIdx > 0 ? contentTxt.substring( 0, brIdx ) : contentTxt;\n/*\n\tvar userName = request.content.user;\n    if(trimmedContent.indexOf(userName+" ") == 0) {\n      // remove the first mention - not required\n      trimmedContent = trimmedContent.substring(userName.length+1);\n    }\n*/\n\n    return {\n      content:{\n        username: request.content.user,\n        text: trimmedContent\n       }\n    };\n\n  }\n}',
					scriptEnabled: true,
				};
				Meteor.call('boardIncomingIntegration', integration, (err, res) => {
					if (err) {
						return handleError(err);
					}
					const whurl = `${ settings.get('Site_Url') }/hooks/${ res._id }/${ res.token }`.replace(/\/\/hooks+/g, '/hooks');
					Integrations.insert({
						userId: Meteor.userId(),
						enabled: true,
						type: 'outgoing-webhooks',
						url: whurl,
						boardId: id,
						activities: ['all'],
					});
				});
			}
		} else {
			id = boardObj._id;
			// add or remove members
			const usernames = subscribedUsername;
			const bdMembers = boardObj.members;
			usernames.forEach((name) => {
				const user = Meteor.users.findOne({ username: name });
				if (user && user._id && bdMembers.indexOf(user._id) === -1) {
					Board.addMember(user._id, boardObj._id);
				}
			});
		}
		return id;
	},
	'board:getMyRoom': () => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'board:getMyRoom',
			});
		}
		const query = {
			t: 'd',
			usersCount: 1,
			uids: Meteor.userId(),
		};
		const room = Rooms.findOne(query);
		if (!room) {
			const user = Meteor.user();
			const droom = createRoom('d', null, null, [user], null, { }, { creator: user._id });
			// const droom = Meteor.call('createDirectMessage', user.username);
			return droom;
		}
		return room;
	},
	'board:getMyTasks': () => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'board:getMyTasks',
			});
		}
		const query = {
			t: 'd',
			usersCount: 1,
			uids: Meteor.userId(),
		};
		let room = Rooms.findOne(query);
		const user = Meteor.user();
		if (!room) {
			room = createRoom('d', null, null, [user], null, {}, { creator: user._id });
			//  room = Rooms.findOne(query);
		}
		const bdtitle = room.usernames.join('-');
		const boardObj = Board.findOne({ title: bdtitle });
		if (!boardObj) {
			const bdMembers = [];
			if (user && user._id) {
				bdMembers.push({
					userId: user._id,
					isAdmin: true,
					isActive: true,
					isCommentOnly: false,
				});
			}
			id = Board.insert({
				title: bdtitle,
				members: bdMembers,
				permission: 'public',
				color: 'belize',
				view: 'board-view-lists',
				allowsAssignee: false,
				allowsMembers: false,
				allowsRequestedBy: false,
				allowsAssignedBy: false,
				allowsReceivedDate: false,
				allowsDueDate: false,
			});
			let listsSetting = settings.get('Board_Mapping');
			if (listsSetting.length > 0) {
				const listsValues = listsSetting.split(',');
				for (let i = 0; i < listsValues.length; i++) {
					const listName = listsValues[i].trim();
					Lists.insert({
						title: listName,
						boardId: id,
					});
				}
			}
			const cfSetting = settings.get('Board_Custom_Fields');
			if (cfSetting.length > 0) {
				const cfValues = cfSetting.split(',');
				let boardIds = [];
				boardIds.push(id);
				for (let i = 0; i < cfValues.length; i++) {
					const cfName = cfValues[i].trim();
					CustomFields.insert({
						boardIds,
						name: cfName,
						type: 'text',
						settings: {},
						showOnCard: true,
					});
				}
			}
			if (room.t !== 'd') {
				const integration = {
					enabled: true,
					username: 'mona',
					channel: `#${ bdtitle }`,
					alias: undefined,
					// emoji: ':card_index:',
					avatar: undefined,
					name: bdtitle,
					script: 'class Script {\n  /**\n   * @params {object} request\n   */\n  process_incoming_request({ request }) {\n    var contentTxt = request.content.text;\n    var brIdx =  contentTxt.indexOf("\\nhttp");\n    var trimmedContent = brIdx > 0 ? contentTxt.substring( 0, brIdx ) : contentTxt;\n/*\n\tvar userName = request.content.user;\n    if(trimmedContent.indexOf(userName+" ") == 0) {\n      // remove the first mention - not required\n      trimmedContent = trimmedContent.substring(userName.length+1);\n    }\n*/\n\n    return {\n      content:{\n        username: request.content.user,\n        text: trimmedContent\n       }\n    };\n\n  }\n}',
					scriptEnabled: true,
				};
				Meteor.call('boardIncomingIntegration', integration, (err, res) => {
					if (err) {
						return handleError(err);
					}
					const whurl = `${ settings.get('Site_Url') }/hooks/${ res._id }/${ res.token }`.replace(/\/\/hooks+/g, '/hooks');
					Integrations.insert({
						userId: Meteor.userId(),
						enabled: true,
						type: 'outgoing-webhooks',
						url: whurl,
						boardId: id,
						activities: ['all'],
					});
				});
			}
		} else {
			// const listquery = {
			// 	title: 'in progress',
			// 	boardId: boardObj._id,
			// 	archived: false,
			// };
			// const listObj = Lists.findOne(listquery);
			// if (listObj) {
			const labels = boardObj.labels;
			let labelID;
			for (let i = 0; i < labels.length; i++) {
				const labelObj = labels[i];
				if(labelObj.name === 'appointment'){
					labelID = labelObj._id;
					break;
				}
			}
			if(!labelID){
				labelID = Board.pushLabel(boardObj._id, 'appointment','lime');
			}
	
			const cardquery = {
				boardId: boardObj._id,
				archived: false,
				labelIds: { $ne: labelID},
			};
			return Cards.find(cardquery, { sort: { sort: 1 }, fields: { _id: 1, description: 1, title: 1, startAt: 1, endAt: 1 } }).fetch();
			// }
		}
		return {};
	},
	'board:getMyGoals': (listtitle) => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'board:getMyGoals',
			});
		}
		const query = {
			t: 'd',
			usersCount: 1,
			uids: Meteor.userId(),
		};
		let room = Rooms.findOne(query);
		if (!room) {
			const user = Meteor.user();
			room = createRoom('d', null, null, [user], null, {}, { creator: user._id });
			// room = Rooms.findOne(query);
		}
		let bdtitle = room.usernames.join('-');
		bdtitle += '-goals';
		const boardObj = Board.findOne({ title: bdtitle });
		if (boardObj) {
			const listquery = {
				title: listtitle,
				boardId: boardObj._id,
				archived: false,
			};
			let listObj = Lists.findOne(listquery);
			if (!listObj) {
				Lists.insert({
					title: listtitle,
					boardId: boardObj._id,
				});
				listObj = Lists.findOne(listquery);
			}
			if (listObj) {
				const cardquery = {
					listId: listObj._id,
					boardId: boardObj._id,
					archived: false,
				};
				return Cards.find(cardquery, { limit: 10, sort: { sort: 1 }, fields: { _id: 1, description: 1, title: 1 } }).fetch();
			}
		}
		return {};
	},

	'board:createBooking': (listBooking) => {
		const query = {
			t: 'd',
			usersCount: 1,
			uids: listBooking.resource_id,
		};
		let room = Rooms.findOne(query);
		if (!room) {
			const user = Subscriptions.findByUserId(listBooking.resource_id, {
				fields: {
					rid: 1,
					bio: 1,
					name: 1,
					t: 1,
					roles: 1,
				},
				sort: {
					t: 1,
					name: 1,
				},
			}).fetch();
			room = createRoom('d', null, null, [user], null, {}, { creator: listBooking.resource_id });
			// room = Rooms.findOne(query);
		}
		const bdtitle = room.usernames.join('-');

		const boardObj = Board.findOne({ title: bdtitle });
		if (!boardObj) {
			const bdMembers = [];


			bdMembers.push({
				userId: listBooking.resource_id,
				isAdmin: true,
				isActive: true,
				isCommentOnly: false,
			});


			const id = Board.insert({
				title: bdtitle,
				members: bdMembers,
				permission: 'public',
				color: 'belize',
				view: 'board-view-lists',
				allowsAssignee: false,
				// allowsMembers: !isSelfBoard,
				allowsRequestedBy: false,
				allowsAssignedBy: false,
				allowsReceivedDate: false,
				allowsDueDate: false,
			});

			Lists.insert({
				title: 'backlog',
				boardId: id,
			});

			const cfSetting = settings.get('Board_Custom_Fields');
			if (cfSetting.length > 0) {
				const cfValues = cfSetting.split(',');
				let boardIds = [];
				boardIds.push(id);
				for (let i = 0; i < cfValues.length; i++) {
					const cfName = cfValues[i].trim();
					CustomFields.insert({
						boardIds,
						name: cfName,
						type: 'text',
						settings: {},
						showOnCard: true,
					});
				}
			}
		}
		const listquery = {
			boardId: boardObj._id,
			title: 'backlog',
			archived: false,
		};
		let listObj = Lists.findOne(listquery);
		if (!listObj) {
			Lists.insert({
				title: 'backlog',
				boardId: boardObj._id,
			});
			listObj = Lists.findOne(listquery);
		}
		// const cardtitle = `${ new Date().toISOString().split('T')[0] } - @${ room.username }`;
		const user = Users.findOneById(listBooking.resource_id, {
			fields: {
				emails: 1,
				name: 1,
				utcOffset: 1,
				username: 1,
			},
		});
		const startDate = moment(listBooking.start);
		startDate.utcOffset(user.utcOffset);
		const endDate = moment(listBooking.end);
		endDate.utcOffset(user.utcOffset);
		listBooking.start = moment(listBooking.start);
		// if(listBooking.customer && listBooking.customer.timezone){
		// 	listBooking.start.tz(listBooking.customer.timezone);
		// }
		const labels = boardObj.labels;
		let labelID = [];
		for (let i = 0; i < labels.length; i++) {
			const labelObj = labels[i];
			if(labelObj.name === 'appointment'){
				labelID.push(labelObj._id);
				break;
			}
		}
		if(labelID.length < 1){
			labelID.push(Board.pushLabel(boardObj._id, 'appointment','lime'));
		}
		Cards.insert({
			title: listBooking.description,
			boardId: boardObj._id,
			listId: listObj._id,
			description: listBooking.description,
			startAt: new Date(startDate.format()),
			endAt: new Date(endDate.format()),
			// userId: listBooking.resource_id,
			labelIds: labelID,
			swimlaneId: 'default',
			sort: 0,
		});
		const from = `${ user.name } <${ user.emails[0].address }>`;
		const email = `${ listBooking.customer.name } <${ listBooking.customer.email }>`;
		const confLink = `${ settings.get('Site_Url') }/conf/${ user.username }`.replace(/\/\/conf+/g, '/conf');
		const userConfLink = `${ settings.get('Site_Url') }/direct/${ room._id }`.replace(/\/\/direct+/g, '/direct');
		Mailer.send({
			to: email,
			// from,
			from: settings.get('From_Email'),
			subject: `Confirmed: 30 minute meeting with ${ user.name } on ${ listBooking.start.format('dddd, MMMM, DD, YYYY') }`,
			html: `<div style="text-align: left">Hi ${ listBooking.customer.name },<br/>Your 30 minute meeting with  ${ user.name }(${ user.emails[0].address }) at ${ listBooking.start.format('h:mm a dddd, MMMM, DD, YYYY') } is scheduled. <br/> <br/> ${ confLink } </div>`,
		});
		Mailer.send({
			to: `${ user.name } <${ user.emails[0].address }>`,
			// from: `${ listBooking.customer.name } <${ listBooking.customer.email }>`,
			from: settings.get('From_Email'),
			subject: `Confirmed: 30 minute meeting with ${ listBooking.customer.name } on ${ startDate.format('dddd, MMMM, DD, YYYY') }`,
			html: `<div style="text-align: left">Hi ${ user.name },<br/>Your 30 minute meeting with ${ listBooking.customer.name } (${ listBooking.customer.email }) at ${ startDate.format('h:mm a dddd, MMMM, DD, YYYY') } is scheduled. <br/>To see the appointment Log into monietalk and go to “My Tasks”
			<br/><br/> ${ userConfLink } </div>`,
		});

		if (listObj) {
			const cardquery = {
				listId: listObj._id,
				boardId: boardObj._id,
				archived: false,
			};
			return Cards.find(cardquery, { limit: 50, sort: { sort: -1 }, fields: { _id: 1, description: 1, title: 1, startAt: 1, endAt: 1 } }).fetch();
		}

		return {};
	},
	'board:getScheduleList': () => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'board:getScheduleList',
			});
		}
		const query = {
			t: 'd',
			usersCount: 1,
			uids: Meteor.userId(),
		};
		let room = Rooms.findOne(query);
		if (!room) {
			const user = Meteor.user();
			room = createRoom('d', null, null, [user], null, {}, { creator: user._id });
			//  room = Rooms.findOne(query);
		}
		const bdtitle = room.usernames.join('-');
		const boardObj = Board.findOne({ title: bdtitle });
		if (boardObj) {
			const labels = boardObj.labels;
			let labelID;
			for (let i = 0; i < labels.length; i++) {
				const labelObj = labels[i];
				if(labelObj.name === 'appointment'){
					labelID = labelObj._id;
					break;
				}
			}
			if(!labelID){
				labelID = Board.pushLabel(boardObj._id, 'appointment','lime');
			}
	
			const cardquery = {
				boardId: boardObj._id,
				archived: false,
				labelIds: labelID,
				startAt:{ $exists: true },
				endAt:{ $exists: true },
			};
			return Cards.find(cardquery, { fields: { _id: 1, description: 1, title: 1, startAt: 1, endAt: 1, userId: 1 } }).fetch();
		}

		return {};
	},
});
