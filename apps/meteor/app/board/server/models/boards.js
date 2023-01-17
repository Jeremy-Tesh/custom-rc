/* eslint-disable no-else-return */
/* eslint-disable no-undef */
import { Mongo } from 'meteor/mongo';
import _ from 'underscore';

import { Base } from './base';

export class Board extends Base {
	constructor() {
		super();
		const Boards = new Mongo.Collection('boards');
		
		// Boards.attachSchema(new SimpleSchema({
		// 	title: {
		// 		type: String,
		// 	},
		// 	slug: {
		// 		type: String,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			// XXX We need to improve slug management. Only the id should be necessary
		// 			// to identify a board in the code.
		// 			// XXX If the board title is updated, the slug should also be updated.
		// 			// In some cases (Chinese and Japanese for instance) the `getSlug` function
		// 			// return an empty string. This is causes bugs in our application so we set
		// 			// a default slug in this case.
		// 			if (this.isInsert && !this.isSet) {
		// 				let slug = 'board';
		// 				const title = this.field('title');
		// 				if (title.isSet) {
		// 					// slug = getSlug(title.value) || slug;
		// 					slug = title.value || slug;
		// 				}
		// 				return slug;
		// 			}
		// 		},
		// 	},
		// 	archived: {
		// 		type: Boolean,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return false;
		// 			}
		// 		},
		// 	},
		// 	view: {
		// 		type: String,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return 'board-view-lists';
		// 			}
		// 		},
		// 	},
		// 	createdAt: {
		// 		type: Date,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return new Date();
		// 			} else {
		// 				this.unset();
		// 			}
		// 		},
		// 	},
		// 	// XXX Inconsistent field naming
		// 	modifiedAt: {
		// 		type: Date,
		// 		optional: true,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isUpdate) {
		// 				return new Date();
		// 			} else {
		// 				this.unset();
		// 			}
		// 		},
		// 	},
		// 	// De-normalized number of users that have starred this board
		// 	stars: {
		// 		type: Number,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return 0;
		// 			}
		// 		},
		// 	},
		// 	// De-normalized label system
		// 	labels: {
		// 		type: [Object],
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				const colors = Boards.simpleSchema()._schema['labels.$.color'].allowedValues;
		// 				const defaultLabelsColors = _.clone(colors).splice(0, 6);
		// 				return defaultLabelsColors.map((color) => ({
		// 					color,
		// 					_id: Random.id(6),
		// 					name: '',
		// 				}));
		// 			}
		// 		},
		// 	},
		// 	'labels.$._id': {
		// 		// We don't specify that this field must be unique in the board because that
		// 		// will cause performance penalties and is not necessary since this field is
		// 		// always set on the server.
		// 		// XXX Actually if we create a new label, the `_id` is set on the client
		// 		// without being overwritten by the server, could it be a problem?
		// 		type: String,
		// 	},
		// 	'labels.$.name': {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	'labels.$.color': {
		// 		type: String,
		// 		allowedValues: [
		// 			'green', 'yellow', 'orange', 'red', 'purple',
		// 			'blue', 'sky', 'lime', 'pink', 'black',
		// 		],
		// 	},
		// 	// XXX We might want to maintain more informations under the member sub-
		// 	// documents like de-normalized meta-data (the date the member joined the
		// 	// board, the number of contributions, etc.).
		// 	members: {
		// 		type: [Object],
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return [{
		// 					userId: this.userId,
		// 					isAdmin: true,
		// 					isActive: true,
		// 					isCommentOnly: false,
		// 				}];
		// 			}
		// 		},
		// 	},
		// 	'members.$.userId': {
		// 		type: String,
		// 	},
		// 	'members.$.isAdmin': {
		// 		type: Boolean,
		// 	},
		// 	'members.$.isActive': {
		// 		type: Boolean,
		// 	},
		// 	'members.$.isCommentOnly': {
		// 		type: Boolean,
		// 	},
		// 	permission: {
		// 		type: String,
		// 		allowedValues: ['public', 'private'],
		// 	},
		// 	color: {
		// 		type: String,
		// 		allowedValues: [
		// 			'belize',
		// 			'nephritis',
		// 			'pomegranate',
		// 			'pumpkin',
		// 			'wisteria',
		// 			'midnight',
		// 		],
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return Boards.simpleSchema()._schema.color.allowedValues[0];
		// 			}
		// 		},
		// 	},
		// 	description: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	allowsSubtasks: {
		// 		/**
		// 		 * Does the board allows subtasks?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},
		// 	allowsAttachments: {
		// 		/**
		// 		 * Does the board allows attachments?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},

		// 	allowsChecklists: {
		// 		/**
		// 		 * Does the board allows checklists?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsComments: {
		// 		/**
		// 		 * Does the board allows comments?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsDescriptionTitle: {
		// 		/**
		// 		 * Does the board allows description title?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsDescriptionText: {
		// 		/**
		// 		 * Does the board allows description text?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsActivities: {
		// 		/**
		// 		 * Does the board allows comments?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsLabels: {
		// 		/**
		// 		 * Does the board allows labels?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsAssignee: {
		// 		/**
		// 		 * Does the board allows assignee?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsMembers: {
		// 		/**
		// 		 * Does the board allows members?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsRequestedBy: {
		// 		/**
		// 		 * Does the board allows requested by?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},

		// 	allowsAssignedBy: {
		// 		/**
		// 		 * Does the board allows requested by?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},

		// 	allowsReceivedDate: {
		// 		/**
		// 		 * Does the board allows received date?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},

		// 	allowsStartDate: {
		// 		/**
		// 		 * Does the board allows start date?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsEndDate: {
		// 		/**
		// 		 * Does the board allows end date?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: true,
		// 	},

		// 	allowsDueDate: {
		// 		/**
		// 		 * Does the board allows due date?
		// 		 */
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},
		
		// }));
		// this.setDBmodel(Boards);
	}

	pushLabel(bid, name, color) {
		const _id = Random.id(6);
		this._db.update(bid, { $push: { labels: { _id, name, color } } });
		return _id;
	}

}
export default new Board();
// RocketChat.models.Boards = mgBoards;
