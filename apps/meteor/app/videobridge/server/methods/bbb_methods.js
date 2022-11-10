import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';
import xml2js from 'xml2js';

// import { API } from '../../../api/server';
import BigBlueButtonApi from '../../../bigbluebutton/server';
import { SystemLogger } from '../../../../server/lib/logger/system';
import { settings } from '../../../settings/server';
import { Rooms, Users } from '../../../models/server';
import { saveStreamingOptions } from '../../../channel-settings/server';
import { canAccessRoom } from '../../../authorization/server';

const parser = new xml2js.Parser({
	explicitRoot: true,
});

const parseString = Meteor.wrapAsync(parser.parseString);

const getBBBAPI = () => {
	const url = settings.get('bigbluebutton_server');
	const secret = settings.get('bigbluebutton_sharedSecret');
	const api = new BigBlueButtonApi(`${url}/bigbluebutton/api`, secret);
	return { api, url };
};

export const BBBMethods = new (class BBBMethods {
	bbbJoin({ rid }) {
		check(rid, String);

		if (!this.userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'bbbJoin' });
		}

		if (!rid) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'bbbJoin' });
		}

		const user = Users.findOneById(this.userId);
		if (!user) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'bbbJoin' });
		}

		const room = Rooms.findOneById(rid);
		if (!room) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'bbbJoin' });
		}

		if (!canAccessRoom(room, user)) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'bbbJoin' });
		}

		if (!settings.get('bigbluebutton_Enabled')) {
			throw new Meteor.Error('error-not-allowed', 'Not Allowed', { method: 'bbbJoin' });
		}

		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + rid;
		const createUrl = api.urlFor('create', {
			name: room.t === 'd' ? 'Direct' : room.name,
			meetingID,
			attendeePW: 'ap',
			moderatorPW: 'mp',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			meta_html5chat: false,
			meta_html5navbar: false,
			meta_html5autoswaplayout: true,
			meta_html5autosharewebcam: false,
			meta_html5hidepresentation: true,
		});

		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);

		if (doc.response.returncode[0]) {
			const hookApi = api.urlFor('hooks/create', {
				meetingID,
				callbackURL: Meteor.absoluteUrl(`api/v1/videoconference.bbb.update/${meetingID}`),
			});

			const hookResult = HTTP.get(hookApi);

			if (hookResult.statusCode !== 200) {
				// TODO improve error logging
				SystemLogger.error(hookResult);
				return;
			}

			saveStreamingOptions(rid, {
				type: 'call',
			});

			return {
				url: api.urlFor('join', {
					password: 'mp', // mp if moderator ap if attendee
					meetingID,
					fullName: user.username,
					userID: user._id,
					joinViaHtml5: true,
					avatarURL: Meteor.absoluteUrl(`avatar/${user.username}`),
					// clientURL: `${ url }/html5client/join`,
				}),
			};
		}
	}

	bbbEnd({ rid }) {
		check(rid, String);

		if (!this.userId) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'bbbEnd' });
		}

		if (!rid) {
			throw new Meteor.Error('error-invalid-room', 'Invalid room', { method: 'bbbEnd' });
		}

		// if (!canAccessRoom({ _id: rid }, { _id: this.userId })) {
		// 	throw new Meteor.Error('error-invalid-user', 'Invalid user', { method: 'bbbEnd' });
		// }

		if (!settings.get('bigbluebutton_Enabled')) {
			throw new Meteor.Error('error-not-allowed', 'Not Allowed', { method: 'bbbEnd' });
		}

		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + rid;
		const endApi = api.urlFor('end', {
			meetingID,
			password: 'mp', // mp if moderator ap if attendee
		});

		const endApiResult = HTTP.get(endApi);

		if (endApiResult.statusCode !== 200) {
			saveStreamingOptions(rid, {});
			throw new Meteor.Error(endApiResult);
		}
		const doc = parseString(endApiResult.content);

		if (['SUCCESS', 'FAILED'].includes(doc.response.returncode[0])) {
			saveStreamingOptions(rid, {});
		}
	}
})();
