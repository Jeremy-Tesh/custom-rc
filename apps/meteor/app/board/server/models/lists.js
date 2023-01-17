/* eslint-disable no-undef */
import { Base } from './base';


export class List extends Base {
	constructor() {
		super();
		const Lists = new Mongo.Collection('lists');

		// Lists.attachSchema(new SimpleSchema({
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
		// 	boardId: {
		// 		type: String,
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
		// 	sort: {
		// 		type: Number,
		// 		decimal: true,
		// 		// XXX We should probably provide a default
		// 		optional: true,
		// 	},
		// 	updatedAt: {
		// 		type: Date,
		// 		optional: true,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isUpdate) {
		// 				return new Date();
		// 			}
		// 			this.unset();
		// 		},
		// 	},
		// 	wipLimit: {
		// 		type: Object,
		// 		optional: true,
		// 	},
		// 	'wipLimit.value': {
		// 		type: Number,
		// 		decimal: false,
		// 		defaultValue: 1,
		// 	},
		// 	'wipLimit.enabled': {
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},
		// 	'wipLimit.soft': {
		// 		type: Boolean,
		// 		defaultValue: false,
		// 	},
		// }));
		// this.setDBmodel(Lists);
	}
}

export default new List();
