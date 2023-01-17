import { Meteor } from 'meteor/meteor';

import { Integrations } from '../../models';

Meteor.methods({
	getNewsIncomingIntegration() {
		const ourQuery = {
			channel: '#news',
			type: 'webhook-incoming',
		};
		const integrations = Integrations.find(ourQuery, {
			sort: { _createdAt: 1 },
			limit: 1,
		}).fetch();
		return integrations;
	},
});
