import { Meteor } from 'meteor/meteor';

import { Rooms, Users } from '../../../../models/server';
import { API } from '../../../../api/server';

API.v1.addRoute(
	'groups.callnotes',
	{ authRequired: false },
	{
		post() {
			const param = this.bodyParams;
			console.log('groups.callnotes', param);
			const callNo = param.callno.toLowerCase();
			if (param.token === 'u6a3fkt40ywp') {
				const managerUser = Users.findOneByEmailAddress(param.manager);
				const enggUser = Users.findOneByEmailAddress(param.user);
				const monaUser = Users.findOneByUsernameIgnoringCase('mona');
				const roomOptions = {
					fields: {
						t: 1,
						ro: 1,
						name: 1,
						fname: 1,
						prid: 1,
						archived: 1,
						broadcast: 1,
					},
				};
				const room = Rooms.findOneByName(callNo, roomOptions);
				if (!room) {
					Meteor.runAsUser(managerUser ? managerUser._id : monaUser._id, () => {
						let members = [];
						if (enggUser && managerUser) {
							members = [enggUser.username, managerUser.username];
						} else if (enggUser) {
							members = [enggUser.username];
						}
						const returned = Meteor.call('createPrivateGroup', callNo, members, false, this.bodyParams.customFields);
						console.log('groups.callnotes  : createPrivateGroup ', callNo, returned);
						Meteor.call('saveNotificationSettings', returned.rid, 'emailNotifications', 'all');
					});
					if (param.productgroup) {
						const supportroom = Rooms.findOneByName(`${callNo}_${param.productgroup.toLowerCase()}`, roomOptions);
						if (!supportroom) {
							Meteor.runAsUser(managerUser ? managerUser._id : monaUser._id, () => {
								let members = [];
								if (enggUser && managerUser) {
									members = [enggUser.username, managerUser.username];
								} else if (enggUser) {
									members = [enggUser.username];
								}
								const returned = Meteor.call(
									'createPrivateGroup',
									`${callNo}_${param.productgroup.toLowerCase()}`,
									members,
									false,
									this.bodyParams.customFields,
								);
								console.log('groups.callnotes  : createPrivateGroup ', `${callNo}_${param.productgroup.toLowerCase()}`, returned);
								Meteor.call('saveNotificationSettings', returned.rid, 'emailNotifications', 'all');
							});
						} else {
							if (enggUser) {
								const supportdata = { rid: supportroom._id };
								supportdata.username = enggUser.username;
								Meteor.runAsUser(enggUser._id, () => {
									Meteor.call('addUserToRoom', supportdata);
									console.log('groups.callnotes  : addUserToRoom ', supportdata);
								});
							}
							if (managerUser.username) {
								const supportdata = { rid: supportroom._id };
								supportdata.username = managerUser.username;
								Meteor.runAsUser(managerUser._id, () => {
									Meteor.call('addUserToRoom', supportdata);
									console.log('groups.callnotes  : addUserToRoom ', supportdata);
								});
							}
						}
					}
				} else {
					// add members
					const data = {};
					data.rid = room._id;
					if (enggUser) {
						data.username = enggUser.username;
						Meteor.runAsUser(enggUser._id, () => {
							Meteor.call('addUserToRoom', data);
							console.log('groups.callnotes  :else addUserToRoom ', data);
						});
					}
					if (managerUser.username) {
						data.username = managerUser.username;
						Meteor.runAsUser(managerUser._id, () => {
							Meteor.call('addUserToRoom', data);
							console.log('groups.callnotes  : esle addUserToRoom ', data);
						});
					}

					if (param.productgroup) {
						const supportroom = Rooms.findOneByName(`${callNo}_${param.productgroup.toLowerCase()}`, roomOptions);
						if (!supportroom) {
							Meteor.runAsUser(managerUser ? managerUser._id : monaUser._id, () => {
								let members = [];
								if (enggUser && managerUser) {
									members = [enggUser.username, managerUser.username];
								} else if (enggUser) {
									members = [enggUser.username];
								}
								const returned = Meteor.call(
									'createPrivateGroup',
									`${callNo}_${param.productgroup.toLowerCase()}`,
									members,
									false,
									this.bodyParams.customFields,
								);
								console.log('groups.callnotes  : createPrivateGroup else ', `${callNo}_${param.productgroup.toLowerCase()}`, returned);
								Meteor.call('saveNotificationSettings', returned.rid, 'emailNotifications', 'all');
							});
						} else {
							if (enggUser) {
								const supportdata = { rid: supportroom._id };
								supportdata.username = enggUser.username;
								Meteor.runAsUser(enggUser._id, () => {
									Meteor.call('addUserToRoom', supportdata);
									console.log('groups.callnotes  : esle2 addUserToRoom ', supportdata);
								});
							}
							if (managerUser.username) {
								const supportdata = { rid: supportroom._id };
								supportdata.username = managerUser.username;
								Meteor.runAsUser(managerUser._id, () => {
									Meteor.call('addUserToRoom', supportdata);
									console.log('groups.callnotes  : esle3 addUserToRoom ', supportdata);
								});
							}
						}
					}
				}
			} else {
				return API.v1.failure('Invalid token');
			}
			return API.v1.success();
		},
	},
);
