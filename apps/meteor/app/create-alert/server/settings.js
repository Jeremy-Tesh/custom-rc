import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('Create Alert', function () {
		this.add('Alert_Notification', false, { type: 'boolean', public: true });
		this.add('Alert_Message', '', { type: 'string', enableQuery: { _id: 'Alert_Notification', value: true }, public: true });
	});
});
