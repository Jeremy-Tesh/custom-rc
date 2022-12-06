import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
	createVertivToken(userId) {
		const token = Accounts._generateStampedLoginToken();
		Accounts._insertLoginToken(userId, token);
		return {
			userId,
			authToken: token.token,
		};
	},
});
