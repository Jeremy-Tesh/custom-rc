import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('App Menu', function () {
		this.add('App_Menu', '', { type: 'string', i18nLabel: 'App_Items', public: true, multiline: true });
	});
});
