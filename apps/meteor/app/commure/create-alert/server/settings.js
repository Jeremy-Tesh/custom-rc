import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('Create Alert', function () {
		this.add('Alert_Notification', false, { type: 'boolean', public: true });
		this.add('SMS_Notification', false, { type: 'boolean', enableQuery: { _id: 'Alert_Notification', value: true }, public: true });
		this.add('Alert_Message', '', {
			type: 'string',
			enableQuery: { _id: 'Alert_Notification', value: true },
			public: true,
			multiline: true,
		});
		this.add('Alert_Security_Dispatch_Message', '', {
			type: 'string',
			enableQuery: { _id: 'Alert_Notification', value: true },
			public: true,
			multiline: true,
		});
		this.add('Alert_Cancel_Message', '', {
			type: 'string',
			enableQuery: { _id: 'Alert_Notification', value: true },
			public: true,
			multiline: true,
		});
	});
});
