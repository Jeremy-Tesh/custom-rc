import { Mongo } from 'meteor/mongo';

import { Base } from '../models/base';

export class Wallet extends Base {
	constructor() {
		super();
		const wallets = new Mongo.Collection('wallet');
		// wallets.attachSchema(new SimpleSchema({
		// 	userId: {
		// 		type: String,
		// 	},
		// 	mnemonics: {
		// 		type: String,
		// 	},
		// 	privatekey: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// 	publickey: {
		// 		type: String,
		// 		optional: true,
		// 	},
		// }));
		// this.setDBmodel(wallets);
	}
}

export default new Wallet();
