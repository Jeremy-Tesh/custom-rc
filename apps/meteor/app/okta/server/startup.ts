import { settingsRegistry } from '../../settings/server';

settingsRegistry.addGroup('OAuth', function () {
	return this.section('Okta_config', function () {
		const enableQuery = {
			_id: 'Accounts_OAuth_Okta',
			value: true,
		};
		this.add('Accounts_OAuth_Okta', false, {
			type: 'boolean',
			public: true,
		});
		this.add('API_Okta_URL', '', {
			type: 'string',
			enableQuery,
			public: true,
			secret: true,
		});
		this.add('Accounts_OAuth_Okta_id', '', {
			type: 'string',
			enableQuery,
		});
		this.add('Accounts_OAuth_Okta_secret', '', {
			type: 'string',
			enableQuery,
			secret: true,
		});
		// this.add('Accounts_OAuth_Okta_server_type', '', {
		// 	type: 'select',
		// 	enableQuery,
		// 	public: true,
		// 	values: [
		// 		{
		// 			key: 'okta-com',
		// 			i18nLabel: 'Accounts_OAuth_Okta_server_type_okta_com',
		// 		},
		// 		{
		// 			key: 'wp-oauth-server',
		// 			i18nLabel: 'Accounts_OAuth_Okta_server_type_wp_oauth_server',
		// 		},
		// 		{
		// 			key: 'custom',
		// 			i18nLabel: 'Accounts_OAuth_Okta_server_type_custom',
		// 		},
		// 	],
		// 	i18nLabel: 'Server_Type',
		// });

		this.add('Accounts_OAuth_Okta_identity_path', '/userinfo', {
			type: 'string',
			enableQuery,
			public: true,
		});
		this.add('Accounts_OAuth_Okta_identity_token_sent_via', 'Same as "Token Sent Via"', {
			type: 'string',
			enableQuery,
			public: true,
		});
		this.add('Accounts_OAuth_Okta_token_path', '/token', {
			type: 'string',
			enableQuery,
			public: true,
		});
		this.add('Accounts_OAuth_Okta_authorize_path', '/authorize', {
			type: 'string',
			enableQuery,
			public: true,
		});
		this.add('Accounts_OAuth_Okta_scope', 'openid email profile groups offline_access', {
			type: 'string',
			enableQuery,
			public: true,
		});
		return this.add('Accounts_OAuth_Okta_callback_url', '_oauth/okta', {
			type: 'relativeUrl',
			readonly: true,
			enableQuery,
		});
	});
});
