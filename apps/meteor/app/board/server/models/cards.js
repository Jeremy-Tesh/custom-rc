/* eslint-disable no-undef */
// import _ from 'underscore';
import { Match } from 'meteor/check';

import { Base } from './base';
import { Users } from '../../../models';

export class Card extends Base {
	constructor() {
		super();
		const CardsObj = new Mongo.Collection('cards');

		// XXX To improve pub/sub performances a card document should include a
		// de-normalized number of comments so we don't have to publish the whole list
		// of comments just to display the number of them in the board view.
		// CardsObj.attachSchema(new SimpleSchema({
		// 	title: {
		// 		type: String,
		// 	},
		// 	archived: {
		// 		type: Boolean,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return false;
		// 			}
		// 		},
		// 	},
		// 	listId: {
		// 		type: String,
		// 	},
		// 	swimlaneId: {
		// 		type: String,
		// 	},
		// 	// The system could work without this `boardId` information (we could deduce
		// 	// the board identifier from the card), but it would make the system more
		// 	// difficult to manage and less efficient.
		// 	boardId: {
		// 		type: String,
		// 	},
		// 	coverId: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	createdAt: {
		// 		type: Date,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return new Date();
		// 			}
		// 			this.unset();
		// 		},
		// 	},
		// 	customFields: {
		// 		type: [Object],
		// 		optional: true,
		// 		defaultValue: [],
		// 	},
		// 	'customFields.$': {
		// 		type: new SimpleSchema({
		// 			_id: {
		// 				type: String,
		// 				optional: true,
		// 				defaultValue: '',
		// 			},
		// 			value: {
		// 				type: Match.OneOf(String, Number, Boolean, Date),
		// 				optional: true,
		// 				defaultValue: '',
		// 			},
		// 		}),
		// 	},
		// 	dateLastActivity: {
		// 		type: Date,
		// 		autoValue() {
		// 			return new Date();
		// 		},
		// 	},
		// 	description: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	labelIds: {
		// 		type: [String],
		// 		optional: true,
		// 	},
		// 	members: {
		// 		type: [String],
		// 		optional: true,
		// 	},
		// 	receivedAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	startAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	dueAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	endAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	spentTime: {
		// 		type: Number,
		// 		decimal: true,
		// 		optional: true,
		// 	},
		// 	isOvertime: {
		// 		type: Boolean,
		// 		defaultValue: false,
		// 		optional: true,
		// 	},
		// 	// XXX Should probably be called `authorId`. Is it even needed since we have
		// 	// the `members` field?
		// 	userId: {
		// 		type: String,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				if(!this.userId){
		// 					const user = Users.findOneByUsername('mona', { fields: { _id: 1 } });
		// 					return user._id;
		// 				}
		// 				return this.userId;
		// 			}
		// 		},
		// 	},
		// 	sort: {
		// 		type: Number,
		// 		decimal: true,
		// 	},
		// }));
		// this.setDBmodel(CardsObj);
	}
}

export default new Card();
