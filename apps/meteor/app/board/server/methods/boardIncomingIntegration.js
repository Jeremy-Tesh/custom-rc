import { Meteor } from 'meteor/meteor';
import { Babel } from 'meteor/babel-compiler';
import { Random } from 'meteor/random';
import _ from 'underscore';
import s from 'underscore.string';

// import { settings } from '../../../settings';
import { Integrations, Rooms, Users, Roles } from '../../../models';
// import { hasAllPermission } from '../../../authorization';

const validChannelChars = ['@', '#'];

Meteor.methods({
	boardIncomingIntegration(integration) {
		if (!_.isString(integration.channel)) {
			throw new Meteor.Error('error-invalid-channel', 'Invalid channel', { method: 'boardIncomingIntegration' });
		}

		if (integration.channel.trim() === '') {
			throw new Meteor.Error('error-invalid-channel', 'Invalid channel', { method: 'boardIncomingIntegration' });
		}

		const channels = _.map(integration.channel.split(','), (channel) => s.trim(channel));

		for (const channel of channels) {
			if (!validChannelChars.includes(channel[0])) {
				throw new Meteor.Error('error-invalid-channel-start-with-chars', 'Invalid channel. Start with @ or #', { method: 'boardIncomingIntegration' });
			}
		}

		if (!_.isString(integration.username) || integration.username.trim() === '') {
			throw new Meteor.Error('error-invalid-username', 'Invalid username', { method: 'boardIncomingIntegration' });
		}

		if (integration.scriptEnabled === true && integration.script && integration.script.trim() !== '') {
			try {
				let babelOptions = Babel.getDefaultOptions({ runtime: false });
				babelOptions = _.extend(babelOptions, { compact: true, minified: true, comments: false });

				integration.scriptCompiled = Babel.compile(integration.script, babelOptions).code;
				integration.scriptError = undefined;
			} catch (e) {
				integration.scriptCompiled = undefined;
				integration.scriptError = _.pick(e, 'name', 'message', 'stack');
			}
		}

		for (let channel of channels) {
			let record;
			const channelType = channel[0];
			channel = channel.substr(1);

			switch (channelType) {
				case '#':
					record = Rooms.findOne({
						$or: [
							{ _id: channel },
							{ name: channel },
						],
					});
					break;
				case '@':
					record = Users.findOne({
						$or: [
							{ _id: channel },
							{ username: channel },
						],
					});
					break;
			}

			if (!record) {
				throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'boardIncomingIntegration' });
			}

			// commented for covid
			// if (!hasAllPermission(this.userId, 'manage-integrations', 'manage-own-integrations') && !Subscriptions.findOneByRoomIdAndUserId(record._id, this.userId, { fields: { _id: 1 } })) {
			// 	throw new Meteor.Error('error-invalid-channel', 'Invalid Channel', { method: 'boardIncomingIntegration' });
			// }
		}

		const user = Users.findOne({ username: integration.username });

		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'boardIncomingIntegration' });
		}

		const token = Random.id(48);

		integration.type = 'webhook-incoming';
		integration.token = token;
		integration.channel = channels;
		integration.userId = user._id;
		integration._createdAt = new Date();
		// integration.avatar = `${ settings.get('Site_Url') }/avatar/mona`;
		integration._createdBy = Users.findOne(this.userId, { fields: { username: 1 } });

		Roles.addUserRoles(user._id, 'bot');

		integration._id = Integrations.insert(integration);

		return integration;
	},
});
