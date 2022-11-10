import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('App Menu', function () {
		this.add('Custom_App_Domain', '', { type: 'string', i18nLabel: 'Domain', public: true });
	});
});
