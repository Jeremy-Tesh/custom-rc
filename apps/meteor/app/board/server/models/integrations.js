/* eslint-disable no-undef */
import _ from 'underscore';

import { Base } from './base';
import { Boards } from './boards';

IntegrationsDB = new Mongo.Collection('integrations');

// IntegrationsDB.attachSchema(new SimpleSchema({
// 	enabled: {
// 		type: Boolean,
// 		defaultValue: true,
// 	},
// 	title: {
// 		type: String,
// 		optional: true,
// 	},
// 	type: {
// 		type: String,
// 		defaultValue: 'outgoing-webhooks',
// 	},
// 	activities: {
// 		type: [String],
// 		defaultValue: ['all'],
// 	},
// 	url: {
// 		type: String,
// 	},
// 	token: {
// 		type: String,
// 		optional: true,
// 	},
// 	boardId: {
// 		type: String,
// 	},
// 	createdAt: {
// 		type: Date,
// 		denyUpdate: false,
// 		autoValue() {
// 			if (this.isInsert) {
// 				return new Date();
// 			}
// 			this.unset();
// 		},
// 	},
// 	userId: {
// 		type: String,
// 	},
// }));

IntegrationsDB.allow({
	insert(userId, doc) {
		return allowIsBoardAdmin(userId, Boards.findOne(doc.boardId));
	},
	update(userId, doc) {
		return allowIsBoardAdmin(userId, Boards.findOne(doc.boardId));
	},
	remove(userId, doc) {
		return allowIsBoardAdmin(userId, Boards.findOne(doc.boardId));
	},
	fetch: ['boardId'],
});

export class Integrations extends Base {
	constructor() {
		super();
		this.setDBmodel(IntegrationsDB);
	}
}

export default new Integrations();
