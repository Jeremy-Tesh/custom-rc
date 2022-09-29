import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function () {
	settingsRegistry.addGroup('Vertiv', function () {
		this.add('vertiv_fsr_form', '', {
			type: 'string',
			group: 'Vertiv',
			public: true,
			multiline: true,
		});
		this.add('vertiv_credentials', '', {
			type: 'string',
			group: 'Vertiv',
			public: true,
			multiline: true,
		});
		this.add('vertiv_email_template', '', {
			type: 'string',
			group: 'Vertiv',
			public: true,
			multiline: true,
		});
		this.add('vertiv_AllowedDomainsList', '', {
			type: 'string',
			group: 'Vertiv',
			public: true,
			multiline: true,
		});
	});
});
