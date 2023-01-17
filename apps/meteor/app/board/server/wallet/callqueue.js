import { Mongo } from 'meteor/mongo';

import { Base } from '../models/base';

export class CallQueue extends Base {
	constructor() {
		super();
		const callqueue = new Mongo.Collection('callqueue');
		// callqueue.attachSchema(new SimpleSchema({
		// 	customerName: {
		// 		type: String,
		// 	},
		// 	customerId: {
		// 		type: String,
		// 	},
		// 	depId: {
		// 		type: String,
		// 	},
		// 	isVip: {
		// 		type: Boolean,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return false;
		// 			}
		// 		},
		// 	},
		// 	requestedAt: {
		// 		type: Date,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert) {
		// 				return new Date();
		// 			}
		// 			this.unset();
		// 		},
		// 	},
		// 	cancelledAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	startAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	endAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	callURL: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	agentId: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	assignedAgent: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	assignedAt: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	failedAgents: {
		// 		type: [Object],
		// 		optional: true,
		// 		defaultValue: [],
		// 	},
		// 	'failedAgents.$': {
		// 		type: new SimpleSchema({
		// 			agentId: {
		// 				type: String,
		// 				optional: true,
		// 				defaultValue: '',
		// 			},
		// 			name: {
		// 				type: String,
		// 				optional: true,
		// 				defaultValue: '',
		// 			},
		// 			assignedAt: {
		// 				type: Date,
		// 				optional: true,
		// 			},
		// 		}),
		// 	},
		// 	rating: {
		// 		type: Number,
		// 		decimal: false,
		// 		defaultValue: 0,
		// 	},
		// 	feedback: {
		// 		type: String,
		// 		optional: true,
		// 		defaultValue: '',
		// 	},
		// 	feedbackBy: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	feedbackAt: {
		// 		type: Date,
		// 		optional: true,
		// 	},
		// 	notify: {
		// 		type: Boolean,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return false;
		// 			}
		// 		},
		// 	},
		// 	callback: {
		// 		type: Boolean,
		// 		autoValue() { // eslint-disable-line consistent-return
		// 			if (this.isInsert && !this.isSet) {
		// 				return false;
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
		// }));
		// this.setDBmodel(callqueue);
	}
}

export default new CallQueue();
