import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('Custom', function () {
		this.add('Custom', true, {
			type: 'boolean',
			public: true,
			i18nLabel: 'Enabled',
			i18nDescription: 'Analytics_features_messages_Description',
		});
		this.add('Custom', '', { type: 'string', i18nLabel: 'Domain' });
	});
});
