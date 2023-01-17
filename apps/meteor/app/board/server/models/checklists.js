/* eslint-disable no-undef */

// import _ from 'underscore';

import { Base } from './base';


export class Checklist extends Base {
	constructor() {
		super();
		const ChecklistsObj = new Mongo.Collection('checklists');
		// ChecklistsObj.attachSchema(new SimpleSchema({
		// 	cardId: {
		// 		type: String,
		// 	},
		// 	title: {
		// 		type: String,
		// 		defaultValue: 'Checklist',
		// 	},
		// 	finishedAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	createdAt: {
		// 		type: Date,
		// 		denyUpdate: false,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return new Date();
		// 			}
		// 			this.unset();
		// 		},
		// 	},
		// 	sort: {
		// 		type: Number,
		// 		decimal: true,
		// 	},
		// }));
		// this.setDBmodel(ChecklistsObj);
	}
}

export default new Checklist();
