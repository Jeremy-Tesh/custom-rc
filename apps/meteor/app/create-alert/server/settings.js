import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('Create Alert', function () {
		const enableQuery = {
			_id: 'Enable',
			value: true,
		};
		this.add('Enable', false, { type: 'boolean', public: true });
		this.add('Alert_Message', '', { type: 'string', enableQuery, public: true });
	});
});
