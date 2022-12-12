import { Meteor } from 'meteor/meteor';
import _ from 'underscore';
import { Match, check } from 'meteor/check';

import { Users } from '../../../../models/server';
import { API } from '../../../../api/server';
import { saveCustomFields, saveUser } from '../../../../lib/server';

API.v1.addRoute(
	'vertivusers.createToken',
	{ authRequired: false },
	{
		post() {
			check(this.bodyParams, {
				email: String,
				vtoken: String,
			});
			const param = this.bodyParams;
			if (param.vtoken === 'u6a3fkt40ywp') {
				const user = Users.findOneByEmailAddress(param.email);
				if (!user) {
					return API.v1.failure('User Not Found');
				}
				let data;
				Meteor.runAsUser(user._id, () => {
					data = Meteor.call('createVertivToken', user._id);
				});
				return data ? API.v1.success({ data }) : API.v1.unauthorized();
			}
			return API.v1.failure('Invalid token');
		},
	},
);

API.v1.addRoute(
	'vertivusers.update',
	{ authRequired: false },
	{
		post() {
			check(this.bodyParams, {
				email: String,
				vtoken: String,
				data: Match.ObjectIncluding({
					email: Match.Maybe(String),
					name: Match.Maybe(String),
					password: Match.Maybe(String),
					username: Match.Maybe(String),
					bio: Match.Maybe(String),
					nickname: Match.Maybe(String),
					statusText: Match.Maybe(String),
					active: Match.Maybe(Boolean),
					roles: Match.Maybe(Array),
					joinDefaultChannels: Match.Maybe(Boolean),
					requirePasswordChange: Match.Maybe(Boolean),
					sendWelcomeEmail: Match.Maybe(Boolean),
					verified: Match.Maybe(Boolean),
					customFields: Match.Maybe(Object),
				}),
			});

			const param = this.bodyParams;
			if (param.vtoken === 'u6a3fkt40ywp') {
				// const monaUser = Users.findOneByUsernameIgnoringCase('mona');
				const user = Users.findOneByEmailAddress(param.email);
				const userData = _.extend({ _id: user._id }, param.data);
				Meteor.runAsUser(user._id, () => saveUser(user._id, userData));
				if (param.data.customFields) {
					saveCustomFields(user._id, param.data.customFields);
				}
				if (typeof this.bodyParams.data.active !== 'undefined') {
					const {
						data: { active },
						confirmRelinquish = false,
					} = this.bodyParams;

					Meteor.runAsUser(user._id, () => {
						Meteor.call('setUserActiveStatus', user._id, active, confirmRelinquish);
					});
				}
				const { fields } = this.parseJsonQuery();

				return API.v1.success({ user: Users.findOneById(user._id, { fields }) });
			}
			return API.v1.failure('Invalid token');
		},
	},
);

API.v1.addRoute(
	'vertivusers.getStatus',
	{ authRequired: false },
	{
		post() {
			check(this.bodyParams, {
				email: String,
				vtoken: String,
			});
			const param = this.bodyParams;
			if (param.vtoken === 'u6a3fkt40ywp') {
				const user = Users.findOneByEmailAddress(param.email);
				return API.v1.success({
					_id: user._id,
					email: user.email,
					message: user.statusText,
					connectionStatus: user.statusConnection,
					status: user.status,
				});
			}
		},
	},
);
