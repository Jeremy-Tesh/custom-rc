import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { API } from '../../../api';
import { Rooms, Users } from '../../../models/server';
import { addUserToRoom } from '../../../lib/server/functions/addUserToRoom';
import Board from '../models/boards';
import Lists from '../models/lists';
import Cards from '../models/cards';
import CustomFields from '../models/customFields';
import Checklists from '../models/checklists';
import Integrations from '../models/integrations';
import { settings } from '../../../settings';
import { sendMessage } from '../../../lib';

API.v1.addRoute('covid/addSymptom', { authRequired: true }, {
	post() {
		const fromuid = this.userId;
		const loc = this.bodyParams.city.toLowerCase();
		const monitor = `${ loc }_volunteers`;
		let room = Rooms.findOneByNameAndType(loc, 'p');
		let monitorroom = Rooms.findOneByNameAndType(monitor, 'p');
		const adminUser = Users.findOneByUsernameIgnoringCase('admin');
		const currUser = Users.findOneById(fromuid);
		if (!room) {
			room = Rooms.createWithIdTypeAndName(Random.id(), 'p', loc);
			addUserToRoom(room._id, adminUser);
			// const subscription = Subscriptions.findOneByRoomIdAndUserId(room._id, adminUser._id);
			// if (Array.isArray(subscription.roles) === true && subscription.roles.includes('owner') !== true) {
			// 	Subscriptions.addRoleById(subscription._id, 'owner');
			// }
			Rooms.setReadOnlyById(room._id, true, adminUser);
			monitorroom = Rooms.createWithIdTypeAndName(Random.id(), 'p', monitor);
			addUserToRoom(monitorroom._id, adminUser);
		}
		if (room) {
			addUserToRoom(room._id, currUser);
			Rooms.muteUsernameByRoomId(room._id, currUser.username);
		}
		// board intialization
		let boardObj = Board.findOne({ title: loc });
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
				title: loc,
				members: bdMembers,
				permission: 'public',
				color: 'midnight',
			});
			boardObj = Board.findOne({ title: loc });
			const listsSetting = settings.get('Board_Mapping');
			if (listsSetting.length > 0) {
				const listsValues = listsSetting.split(',');
				for (let i = 0; i < listsValues.length; i++) {
					const listName = listsValues[i].trim();
					Lists.insert({
						title: listName,
						boardId: bId,
					});
				}
			}
			const cfSetting = settings.get('Board_Custom_Fields');
			if (cfSetting.length > 0) {
				const cfValues = cfSetting.split(',');
				let boardIds = [];
				boardIds.push(bId);

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
			const integration = {
				enabled: true,
				username: 'mona',
				channel: `#${ monitor }`,
				alias: undefined,
				// emoji: ':card_index:',
				avatar: undefined,
				name: monitor,
				script: 'class Script {\n  /**\n   * @params {object} request\n   */\n  process_incoming_request({ request }) {\n    var contentTxt = request.content.text;\n    var brIdx =  contentTxt.indexOf("\\nhttp");\n    var trimmedContent = brIdx > 0 ? contentTxt.substring( 0, brIdx ) : contentTxt;\n/*\n\tvar userName = request.content.user;\n    if(trimmedContent.indexOf(userName+" ") == 0) {\n      // remove the first mention - not required\n      trimmedContent = trimmedContent.substring(userName.length+1);\n    }\n*/\n\n    return {\n      content:{\n        username: request.content.user,\n        text: trimmedContent\n       }\n    };\n\n  }\n}',
				scriptEnabled: true,
			};
			try {
				Meteor.call('boardIncomingIntegration', integration, (err, res) => {
					if (err) {
						console.log(err);
						return;
						// return handleError(err);
					}
					const whurl = `${ settings.get('Site_Url') }/hooks/${ res._id }/${ res.token }`.replace(/\/\/hooks+/g, '/hooks');
					Integrations.insert({
						userId: adminUser._id,
						enabled: true,
						type: 'outgoing-webhooks',
						url: whurl,
						boardId: bId,
						activities: ['all'],
					});
				});
			} catch (error) {
				console.log(error);
			}
		}
		bId = boardObj._id;
		const customFieldVal = [];
		if (this.bodyParams.symptom) {
			const definitions = CustomFields.find({ boardIds: bId }).fetch();
			for (let i = 0; i < definitions.length; i++) {
				if (definitions[i].name === 'symtomdata') {
					customFieldVal[i] = { _id: definitions[i]._id, value: this.bodyParams.symptom };
				} else {
					customFieldVal[i] = { _id: definitions[i]._id, value: this.bodyParams.formdata };
				}
			}
		}
		if (this.bodyParams.formdata) {
			const questionaireObj = JSON.parse(this.bodyParams.formdata);
			for (const i in questionaireObj) {
				var obj = questionaireObj[i];
				for (var key in obj){
					var attrName = key;
					var attrValue = obj[key];
					const customfields = CustomFields.find({ name: attrName, boardIds: bId }, { fields: { _id: 1, name: 1 } }).fetch();
					if (customfields.length === 0) {
						let boardIds = [];
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
		}
		let listObj;
		let createChecklist = false;
		let volunteerMsg = '';
		if (this.bodyParams.level && this.bodyParams.level === 1) {
			createChecklist = true;
			volunteerMsg = 'having Symptoms';
			listObj = Lists.findOne({
				title: 'Symptoms',
				boardId: bId,
			});
		} else if (this.bodyParams.level && this.bodyParams.level === 2) {
			createChecklist = true;
			volunteerMsg = 'COVID Infected';
			listObj = Lists.findOne({
				title: 'COVID Infected',
				boardId: bId,
			});
		} else {
			createChecklist = true;
			volunteerMsg = 'Healthy';
			listObj = Lists.findOne({
				title: 'Healthy',
				boardId: bId,
			});
		}
		if (!listObj) {
			listObj = Lists.findOne({
				boardId: bId,
			});
		}
		const cardtitle = `${ new Date().toISOString().split('T')[0] } - @${ currUser.username }`;
		const cardId = Cards.insert({
			title: cardtitle,
			boardId: bId,
			listId: listObj._id,
			description: this.bodyParams.address,
			userId: fromuid,
			swimlaneId: 'default',
			sort: 0,
			customFields: customFieldVal,
		});
		const monauser = Users.findOneByUsernameIgnoringCase('mona');
		sendMessage(monauser, { msg: `${ currUser.username } is ${ volunteerMsg }` }, { _id: monitorroom._id });

		if (createChecklist && this.bodyParams.symptom) {
			try {
				const questionaireObj = JSON.parse(this.bodyParams.symptom);
				// eslint-disable-next-line guard-for-in
				for (const i in questionaireObj) {
					if (questionaireObj[i] && questionaireObj[i].add) {
						Checklists.insert({
							cardId,
							title: questionaireObj[i].add,
							sort: i,
						});
					}
				}
			// eslint-disable-next-line no-empty
			} catch (error) {
				console.log('error ', error);
			}
		}
	},
});
