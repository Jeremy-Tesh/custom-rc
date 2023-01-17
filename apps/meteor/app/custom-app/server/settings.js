import { Meteor } from 'meteor/meteor';

import { settings } from '../../settings';

Meteor.startup(function() {
	settings.addGroup('Custom_App', function() {
		this.add('Custom_App_Enabled', '', {
			type: 'boolean',
			i18nLabel: 'Enabled',
			public: true,
		});
		this.add('Custom_App_Domain', true, {
			type: 'string',
			i18nLabel: 'Domain',
			enableQuery: {
				_id: 'Custom_App_Enabled',
				value: true,
			},
			alert: 'JSON [{name,url,roles[]}]',
			public: true,
		});
		this.add('Team_Group_Name', '', {
			type: 'string',
			i18nLabel: 'Team_Group_Name',
			enableQuery: {
				// _id: 'Custom_App_Enabled',
				value: '',
			},
			public: true,
		});
		this.add('Client_Group_Name', '', {
			type: 'string',
			i18nLabel: 'Client_Group_Name',
			enableQuery: {
				// _id: 'Custom_App_Enabled',
				value: '',
			},
			public: true,
		});
		this.add('Invite_Username', '', {
			type: 'string',
			i18nLabel: 'Invite_Username',
			enableQuery: {
				// _id: 'Custom_App_Enabled',
				value: '',
			},
			public: true,
		});
		this.add('Invite_Message', '', {
			type: 'string',
			multiline: true,
			i18nLabel: 'Invite_Message',
			enableQuery: {
				// _id: 'Custom_App_Enabled',
				value: '',
			},
			public: true,
		});
		this.add('Client_Group_Enabled', '', {
			type: 'boolean',
			i18nLabel: 'Client_Group_Enabled',
			public: true,
		});

		this.add('Schedule_profile', '', {
			type: 'boolean',
			i18nLabel: 'Schedule_profile',
			public: true,
		});

	});
});
