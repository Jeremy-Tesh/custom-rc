import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

import { API } from '../../../api/server/api';
import { settings } from '../../../settings';
import { Rooms, Users, Subscriptions } from '../../../models/server';
import { addUserToRoom } from '../../../lib/server/functions/addUserToRoom';
import { sendMessage } from '../../../lib';
import { createRoom } from '../../../lib/server';
import Board from '../models/boards';
import Lists from '../models/lists';
import Cards from '../models/cards';
import CustomFields from '../models/customFields';
import { Integrations } from '../../../models';

API.v1.addRoute('business.joinuser', { authRequired: true }, {
	post() {
		check(this.bodyParams, {
			roomname: String,
		});
		const roomObj = Rooms.findOneByName(this.bodyParams.roomname);
		const fromuid = this.userId;
		const currUser = Users.findOneById(fromuid);
		if (roomObj && roomObj.isBusinessGroup) {
			addUserToRoom(roomObj._id, currUser);
			const monauser = Users.findOneByUsernameIgnoringCase('mona');
			if (monauser) {
				const { _id: rid } = createRoom('d', null, null, [monauser, currUser], null, { }, { creator: monauser._id });
				const message = `You have joined in ${ this.bodyParams.roomname }`;
				let joinMessage = settings.get('Message_BusinessUserJoin');
				// [site_url]/conf/[username]
				joinMessage = joinMessage ? joinMessage.replace('[roomname]', this.bodyParams.roomname) : message;
				//
				sendMessage(monauser, { msg: joinMessage }, { _id: rid });
			}
			API.v1.success('done');
		} else {
			API.v1.failure('Room is not for business');
		}
	},
});

API.v1.addRoute('business.getDetails', { authRequired: true }, {
	get() {
		//         // {
		//         //     "joinStatus": "Can Join",
		//         //     "form": "{\"formId\":\"ABC001\",\"submitName\":\"Submit\",\"formDetails\":[{\"name\":\"What is the capital of India?\",\"type\":\"input\"},{\"name\":\"Delhi is not the capital of India.\",\"type\":\"radio\",\"option\":[\"True\",\"False\"]},{\"name\":\"Which one is capital of India\",\"type\":\"select\",\"option\":[\"Gujarat\",\"Delhi\",\"Tamil Nadu\"]},{\"name\":\"______ is the capital of India\",\"type\":\"check\",\"option\":[\"Gujarat\",\"Delhi\",\"New Delhi\"]},{\"name\":\"Describe about India\",\"type\":\"textarea\"},{\"name\":\"how many states in India?\",\"type\":\"number\"}]}",
		//         //     "businessHome": "<!DOCTYPE html>\n<html>\n<head>\n<style>\ntable {\n  font-family: arial, sans-serif;\n  border-collapse: collapse;\n  width: 100%;\n}\ntd, th {\n  border: 1px solid #dddddd;\n  text-align: left;\n  padding: 8px;\n}\ntr:nth-child(even) {\n  background-color: #dddddd;\n}\n</style>\n</head>\n<body>\n<h2>HTML Table</h2>\n<table>\n  <tr>\n    <th>Company</th>\n    <th>Contact</th>\n    <th>Country</th>\n  </tr>\n  <tr>\n    <td>Alfreds Futterkiste</td>\n    <td>Maria Anders</td>\n    <td>Germany</td>\n  </tr>\n</table>\n</body>\n</html>"
		//         //   }
		const { roomname } = this.requestParams();
		const roomObj = Rooms.findOneByNameAndType(roomname, 'p');
		if (roomObj) {
			if (typeof roomObj.isBusinessGroup === 'undefined' ? false : !!roomObj.isBusinessGroup) {
				let joinStatus = 'Can Join';
				let form = roomObj.joinForm;
				const businessHome = roomObj.description ? roomObj.description : `Welcome to ${ roomObj.name }`;
				const boardObj = Board.findOne({ title: `${ roomObj.name }::-::join` });
				const fromuid = [this.userId];
				if (boardObj) {
					const query = {
						boardId: boardObj._id,
						archived: false,
						members: {
							$in: fromuid,
						},
					};
					const cards = Cards.find(query).fetch();
					if (cards && cards.length > 0) {
						listObj = Lists.findOne({
							_id: cards[0].listId,
						});
						if (listObj) {
							joinStatus = listObj.title === 'New' ? 'Waiting for approval' : listObj.title;
							// if(listObj.title === 'New'){  // Rejected
							form = roomObj.joinForm;
							// } else {
							//     form = '';
							// }
						}
					}
				}
				const result = { joinStatus, form, businessHome };
				return API.v1.success(result);
			}
			API.v1.failure('Room is not for business');
		}
		API.v1.failure('no business room found');
	},
});

function getBoardbyName(formId, boardname, fromuid, isJoinForm, questionaireObj) {
	let boardObj = Board.findOne({ title: boardname });
	const adminUser = Users.findOneByUsernameIgnoringCase('admin');
	const currUser = Users.findOneById(fromuid);
	let bId = null;
	if (!boardObj) {
		const bdMembers = [];
		bdMembers.push({
			userId: adminUser._id,
			isAdmin: true,
			isActive: true,
			isCommentOnly: false,
		});
		bdMembers.push({
			userId: fromuid,
			isAdmin: true,
			isActive: true,
			isCommentOnly: false,
		});
		bId = Board.insert({
			title: boardname,
			members: bdMembers,
			permission: 'public',
			color: 'midnight',
		});
		boardObj = Board.findOne({ title: boardname });
		const listsValues = isJoinForm ? ['New', 'Accepted', 'Rejected'] : ['Submitted'];
		for (let i = 0; i < listsValues.length; i++) {
			const listName = listsValues[i].trim();
			Lists.insert({
				title: listName,
				boardId: bId,
			});
		}
	}
	bId = boardObj._id;
	const customFieldVal = [];
	if (questionaireObj) {
		for (const i in questionaireObj) {
			const obj = questionaireObj[i];
			for (const key in obj) {
				const attrName = key;
				const attrValue = obj[key];
				const customfields = CustomFields.find({ name: attrName, boardIds: bId }, { fields: { _id: 1, name: 1 } }).fetch();
				if (customfields.length === 0) {
					const boardIds = [];
					boardIds.push(bId);

					const createCustomField = CustomFields.insert({
						boardIds,
						name: attrName,
						type: 'text',
						settings: {},
						showOnCard: true,
					});

					customFieldVal.push({ _id: createCustomField, value: attrValue });
				} else {
					for (let i = 0; i < customfields.length; i++) {
						if (customfields[i].name === attrName) {
							customFieldVal.push({ _id: customfields[i]._id, value: attrValue });
						}
					}
				}
			}
		}
		const listObj = Lists.findOne({
			title: isJoinForm ? 'New' : 'Submitted',
			boardId: bId,
		});
		const cardtitle = `${ formId } - @${ currUser.username }`;
		const cardId = Cards.insert({
			title: cardtitle,
			boardId: bId,
			listId: listObj._id,
			description: `${ new Date().toISOString().split('T')[0] } - @${ currUser.username }`,
			userId: fromuid,
			members: [fromuid],
			swimlaneId: 'default',
			sort: 0,
			customFields: customFieldVal,
		});
		return 'success';
	}
	return 'empty form';
}

function sendToWebhook(room) {
	const ourQuery = {
		channel: `#${ room.name }`,
		type: 'webhook-incoming',
	};
	const integrations = Integrations.find(ourQuery, {
		sort: { _createdAt: 1 },
		limit: 1,
	}).fetch();
	if (integrations && integrations.length > 0) {
		const completeToken = `${ integrations[0]._id }/${ integrations[0].token }`;
		const url = Meteor.absoluteUrl(`hooks/${ completeToken }`);
		const options = { data: { text: `Form Submitted in ${ room.topic ? room.topic : room.name }` } };
		return HTTP.post(url, options);
	}
}

API.v1.addRoute('form.submitorder', { authRequired: true }, {
	post() {
		// check(this.bodyParams, {
		// 	roomId: String,
		// 	formdata: String,
		// });
		return API.v1.success();
	},
});

API.v1.addRoute('form.submit', { authRequired: true }, {
	post() {
		check(this.bodyParams, {
			formId: String,
			formdata: String,
		});
		const fromuid = this.userId;
		const inputFormId = this.bodyParams.formId;
		const questionaireObj = JSON.parse(this.bodyParams.formdata);
		const temp = inputFormId.split('::-::');
		if (temp.length > 1) {
			const roomObj = Rooms.findOneByNameAndType(temp[0], 'p');
			console.log(temp[0], roomObj);
			if (!roomObj) {
				API.v1.failure('form room is not found');
			}
			const boardname = temp.length > 2 ? `${ temp[0] }::-::${ temp[1] }` : temp[0];
			const submitFormId = temp.length > 2 ? temp[2] : inputFormId;
			// fromuid, isJoinForm, questionaireObj
			const result = getBoardbyName(submitFormId, boardname, fromuid, temp[1] === 'join', questionaireObj);
			// roomId, userId, form
			if (temp[1] === 'join') {
				const monauser = Users.findOneByUsernameIgnoringCase('mona');
				if (monauser) {
					const currUser = Users.findOneById(fromuid);
					sendToWebhook(roomObj);
					if (currUser && currUser.username === 'webadmin') {
						const message = `Form submitted in ${ temp[0] }`;
						sendMessage(monauser, { msg: message }, { _id: roomObj._id });
						// sendAllNotifications(denormalizedMessage, room);
					} else {
						const { _id: rid } = createRoom('d', null, null, [monauser, currUser], null, { }, { creator: monauser._id });
						const message = `thanks for submitting interest in ${ temp[0] }`;
						sendMessage(monauser, { msg: message }, { _id: rid });
					}
				}
			} else { // only for non join form
				Subscriptions.updateFormByUserAndRoom(roomObj._id, fromuid, '');
			}
			return API.v1.success(result);
		}
		API.v1.failure('unknown form id');
	},
});
