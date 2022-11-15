import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ServiceConfiguration } from 'meteor/service-configuration';
import _ from 'underscore';

import { settings } from '../../settings';
import { CustomOAuth } from '../../custom-oauth';

const config = {
	serverURL: '',
	identityPath: '/userinfo',
	clientId: settings.get('Accounts_OAuth_Okta_id'),
	addAutopublishFields: {
		forLoggedInUser: ['services.okta'],
		forOtherUsers: ['services.okta.user_login'],
	},
	accessTokenParam: 'access_token',
	loginStyle: 'redirect',
};

const fillSettings = _.debounce(
	Meteor.bindEnvironment(() => {
		config.serverURL = settings.get('API_Okta_URL');
		if (!config.serverURL) {
			if (config.serverURL === undefined) {
				return fillSettings();
			}
			return;
		}

		// delete config.identityPath;
		// delete config.identityTokenSentVia;
		// delete config.authorizePath;
		// delete config.tokenPath;
		// delete config.scope;

		if (settings.get('Accounts_OAuth_Okta_identity_path')) {
			config.identityPath = settings.get('Accounts_OAuth_Okta_identity_path');
		}

		if (settings.get('Accounts_OAuth_Okta_identity_token_sent_via')) {
			config.identityTokenSentVia = settings.get('Accounts_OAuth_Okta_identity_token_sent_via');
		}

		if (settings.get('Accounts_OAuth_Okta_token_path')) {
			config.tokenPath = settings.get('Accounts_OAuth_Okta_token_path');
		}

		if (settings.get('Accounts_OAuth_Okta_authorize_path')) {
			config.authorizePath = settings.get('Accounts_OAuth_Okta_authorize_path');
		}

		if (settings.get('Accounts_OAuth_Okta_scope')) {
			config.scope = settings.get('Accounts_OAuth_Okta_scope');
		}

		const Okta = new CustomOAuth('okta', config);

		const result = Okta.configure(config);
		if (Meteor.isServer) {
			const enabled = settings.get('Accounts_OAuth_Okta');
			if (enabled) {
				ServiceConfiguration.configurations.upsert(
					{
						service: 'okta',
					},
					{
						$set: config,
					},
				);
			} else {
				ServiceConfiguration.configurations.remove({
					service: 'okta',
				});
			}
		}

		return result;
	}),
	Meteor.isServer ? 1000 : 100,
);

if (Meteor.isServer) {
	Meteor.startup(function () {
		return settings.watchByRegex(/(API\_Okta\_URL)?(Accounts\_OAuth\_Okta\_)?/, () => fillSettings());
	});
} else {
	Meteor.startup(function () {
		return Tracker.autorun(function () {
			return fillSettings();
		});
	});
}
