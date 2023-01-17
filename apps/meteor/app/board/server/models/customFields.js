/* eslint-disable no-undef */
import { Base } from './base';
import Cards from './cards';

export class CustomFields extends Base {
	constructor() {
		super();
		const CustomFieldsDB = new Mongo.Collection('customFields');

		// CustomFieldsDB.attachSchema(new SimpleSchema({
		// 	boardIds: {
		// 		/**
		// 		 * the ID of the board
		// 		 */
		// 		type: [String],
		// 	},
		// 	name: {
		// 		type: String,
		// 	},
		// 	type: {
		// 		/**
		// 		 * type of the custom field
		// 		 */
		// 		type: String,
		// 		allowedValues: ['text', 'number', 'date', 'dropdown', 'currency'],
		// 	},
		// 	settings: {
		// 		type: Object,
		// 	},
		// 	'settings.dropdownItems': {
		// 		type: [Object],
		// 		optional: true,
		// 	},
		// 	'settings.dropdownItems.$': {
		// 		type: new SimpleSchema({
		// 			_id: {
		// 				type: String,
		// 			},
		// 			name: {
		// 				type: String,
		// 			},
		// 		}),
		// 	},
		// 	showOnCard: {
		// 		type: Boolean,
		// 	},
		// }));

		// // not sure if we need this?
		// // CustomFieldsDB.hookOptions.after.update = { fetchPrevious: false };

		// this.setDBmodel(CustomFieldsDB);
	}
}

export default new CustomFields();
