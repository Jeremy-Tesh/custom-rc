import { Mongo } from 'meteor/mongo';

import { Base } from '../models/base';

export class Badge extends Base {
	constructor() {
		super();
		const badges = new Mongo.Collection('badge');
		// badges.attachSchema(new SimpleSchema({
		// 	touid: {
		// 		type: String,
		// 	},
		// 	badgeId: {
		// 		type: String,
		// 	},
		// 	comments: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	fromuid: {
		// 		type: String,
		// 	},
		// 	category: {
		// 		type: String,
		// 	},
		// 	ts: {
		// 		type: Date,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return new Date();
		// 			}
		// 			this.unset();
		// 		},
		// 	},
		// }));
		// this.setDBmodel(badges);
	}
}

export default new Badge();
