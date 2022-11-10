import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('HomePage Card', function () {
		this.add('Custom_Cards', '', { type: 'string', i18nLabel: 'Cards in json format', public: true, multiline: true });
	});
});
