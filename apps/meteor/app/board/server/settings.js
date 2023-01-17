import { Meteor } from 'meteor/meteor';

import { settingsRegistry } from '../../settings/server';

Meteor.startup(function() {
	settingsRegistry.addGroup('Board', function() {
		this.add('Board_Enabled', true, {
			type: 'boolean',
			i18nLabel: 'Enabled',
			alert: 'This Feature is currently in alpha!',
			public: true,
		});
		this.add('MyTasks_Enabled', false, {
			type: 'boolean',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'MyTasks_Enabled',
			public: true,
		});

		this.add('MyGoals_Enabled', false, {
			type: 'boolean',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'MyGoals_Enabled',
			public: true,
		});

		this.add('Board_Domain', 'board', {
			type: 'string',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'Domain',
			public: true,
		});

		this.add('Board_Mapping', 'requested,in progress,issued', {
			type: 'string',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'Mapping',
			alert: 'lists are seperated by comma . ex., requested,in progress,issued',
			public: true,
		});

		this.add('Board_Custom_Fields', 'certificateJson,certificateHtml', {
			type: 'string',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'Custom_Fields',
			alert: 'Fields, comma seperated, default type text . ex., certificateJson,certificateHtml',
			public: true,
		});

		this.add('Board_Enable_Channels', false, {
			type: 'boolean',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'Board_Enable_Channels',
			public: true,
		});
		this.add('Board_Set_Title', false, {
			type: 'boolean',
			enableQuery: {
				_id: 'Board_Enabled',
				value: true,
			},
			i18nLabel: 'Board_Set_Title',
			public: true,
		});
	});
});
