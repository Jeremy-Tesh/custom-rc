import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import xml2js from 'xml2js';

import BigBlueButtonApi from '../../../bigbluebutton/server';
import { settings } from '../../../settings';
import { Rooms, Users } from '../../../models';
import { createRoom } from '../../../lib/server';
import { saveStreamingOptions } from '../../../channel-settings';
import { hasRole } from '../../../authorization';
import { sendMessage } from '../../../lib';

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

Meteor.methods({
	getConfroomDetails({ confroom }) {
		return Users.findOneById(confroom, { fields: { _id: 1, name: 1, username: 1, roles: 1 } })
		// return Users.findOneByUsernameIgnoringCase(confroom, { fields: { _id: 1, name: 1, username: 1, roles: 1 } });
	},

	'conf:getMyConfURL': () => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'conf:getMyConfURL',
			});
		}
		if (settings.get('bigbluebutton_Enabled') && settings.get('MyConf_Enabled') && !hasRole(Meteor.userId(), 'customer')) {
			let confLink = settings.get('SMS_Conf_URL_Message');
			// [site_url]/conf/[username]
			confLink = confLink.replace('[site_url]', settings.get('Site_Url'));
			confLink = confLink.replace('[username]', Meteor.user().username);
			// const confLink = `${ settings.get('Site_Url') }/conf/${ Meteor.user().username }`.replace(/\/\/conf+/g, '/conf');
			return confLink;
		}
		return null;
	},

	'conf:getMyRoom': () => {
		if (!Meteor.userId()) {
			throw new Meteor.Error('error-invalid-user', 'Invalid user', {
				method: 'conf:getMyRoom',
			});
		}
		const query = {
			t: 'd',
			usersCount: 1,
			uids: Meteor.userId(),
		};
		const room = Rooms.findOne(query);

		if (room) {
			const live = Rooms.findOne({ _id: room._id, 'streamingOptions.type': 'call' }, { fields: { streamingOptions: 1 } });
			return live;
		}
		return null;
	},

	sendConfWaitingMsg({ userid, waitername }) {
		const query = {
			t: 'd',
			usersCount: 1,
			uids: userid,
		};
		let room = Rooms.findOne(query);
		if (!room) {
			const user = Users.findOneById(userid);
			room = createRoom('d', null, null, [user], null, {}, { creator: userid });
		}
		const monauser = Users.findOneByUsernameIgnoringCase('mona');
		sendMessage(monauser, { msg: `${waitername} is waiting in your conference room` }, { _id: room._id }, saveStreamingOptions(room._id, {
			type: 'call',
		}));
	},

	createConf({ confrid, name }) {
		const userObj = Users.findOneById(confrid);
		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + confrid;
		const confArgsCreate = {
			name: `${name}'s personal room`,
			meetingID,
			attendeePW: 'ap',
			moderatorPW: 'mp',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			guestPolicy: 'ASK_MODERATOR',
			meta_html5chat: false,
			meta_html5navbar: false,
			meta_html5autoswaplayout: true,
			meta_html5autosharewebcam: false,
			meta_html5hidepresentation: true,
		};

		const customValue = settings.get('bigbluebutton_custom_vanity'); // default
		if (customValue && customValue.length > 0) {
			const customValueArr = customValue.split('\n');
			for (let i = 0; i < customValueArr.length; i++) {
				const keyValuePair = customValueArr[i].split('=');
				if (keyValuePair.length > 1) {
					let fieldKey = keyValuePair[0];
					if (!fieldKey.startsWith('userdata-bbb_custom_style_url')) {
						fieldKey = fieldKey.startsWith('prospect_') ? 'userdata-bbb_custom_style_url' : fieldKey;
						confArgsCreate[fieldKey] = keyValuePair[1];
					}
				}
			}
		}

		const createUrl = api.urlFor('create', confArgsCreate);
		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);
		if (doc.response.returncode[0]) {
			const hookApi = api.urlFor('hooks/create', {
				meetingID,
				logoutURL: Meteor.absoluteUrl('home'),
			});

			const hookResult = HTTP.get(hookApi);

			if (hookResult.statusCode !== 200) {
				// TODO improve error logging
				console.log({ hookResult });
			}
			return doc.response.hasUserJoined;
		}
		return false;
	},

	joinConf({ confrid, name }) {
		// const user = Users.findOneById(confrid);
		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + confrid;
		return {
			url: api.urlFor('join', {
				password: 'ap', // mp if moderator ap if attendee
				meetingID,
				attendeePW: true,
				fullName: name,
				userID: confrid,
				joinViaHtml5: true,
				guest: true,
			}),
		};
	},

	createTcsConf({ confrid, name }) {
		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + confrid;
		const confArgsCreateJoin = {
			name: 'Support call',
			meetingID,
			attendeePW: 'ap',
			moderatorPW: 'mp',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			meta_html5chat: false,
			meta_html5navbar: false,
			meta_html5autoswaplayout: true,
			meta_html5autosharewebcam: false,
			meta_html5hidepresentation: true,
			record: true,
			allowStartStopRecording: false,
			logoutURL: Meteor.absoluteUrl('home'),
			redirect: true,
		};


		const customValue = settings.get('bigbluebutton_custom_vanity'); // default
		if (customValue && customValue.length > 0) {
			const customValueArr = customValue.split('\n');
			for (let i = 0; i < customValueArr.length; i++) {
				if (!customValueArr[i].startsWith('prospect_')) {
					const keyValuePair = customValueArr[i].split('=');
					if (keyValuePair.length > 1) {
						confArgsCreateJoin[keyValuePair[0]] = keyValuePair[1];
					}
				}
			}
		}


		const createUrl = api.urlFor('create', confArgsCreateJoin);
		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);

		if (doc.response.returncode[0]) {
			// const user = Users.findOneById(this.userId);

			const hookApi = api.urlFor('hooks/create', {
				meetingID,
				callbackURL: Meteor.absoluteUrl(`api/v1/videoconference.bbb.update/${meetingID}`),
				logoutURL: Meteor.absoluteUrl('home'),
			});

			const hookResult = HTTP.get(hookApi);

			if (hookResult.statusCode !== 200) {
				// TODO improve error logging
				console.log({ hookResult });
				return;
			}

			const confArgsJoin = {
				password: 'mp', // mp if moderator ap if attendee
				meetingID,
				attendeePW: true,
				fullName: name,
				userID: confrid,
				joinViaHtml5: true,
				// avatarURL: Meteor.absoluteUrl(`avatar/${ Meteor.user().username }`),
			};

			if (customValue && customValue.length > 0) {
				const customValueArr = customValue.split('\n');
				for (let i = 0; i < customValueArr.length; i++) {
					const keyValuePair = customValueArr[i].split('=');
					if (keyValuePair.length > 1) {
						confArgsJoin[keyValuePair[0]] = keyValuePair[1];
					}
				}
			}

			return {
				url: api.urlFor('join', confArgsJoin),
			};
		}
	},


	createJoinConf({ confrid }) {
		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + confrid;
		const confArgsCreateJoin = {
			name: `${Meteor.user().name}'s personal room`,
			meetingID,
			attendeePW: 'ap',
			moderatorPW: 'mp',
			welcome: '<br>Welcome to <b>%%CONFNAME%%</b>!',
			guestPolicy: 'ASK_MODERATOR',
			meta_html5chat: false,
			meta_html5navbar: false,
			meta_html5autoswaplayout: true,
			meta_html5autosharewebcam: false,
			meta_html5hidepresentation: true,
			record: true,
			allowStartStopRecording: true,
			logoutURL: Meteor.absoluteUrl('home'),
			redirect: true,
		};


		const customValue = settings.get('bigbluebutton_custom_vanity'); // default
		if (customValue && customValue.length > 0) {
			const customValueArr = customValue.split('\n');
			for (let i = 0; i < customValueArr.length; i++) {
				if (!customValueArr[i].startsWith('prospect_')) {
					const keyValuePair = customValueArr[i].split('=');
					if (keyValuePair.length > 1) {
						confArgsCreateJoin[keyValuePair[0]] = keyValuePair[1];
					}
				}
			}
		}


		const createUrl = api.urlFor('create', confArgsCreateJoin);
		const createResult = HTTP.get(createUrl);
		const doc = parseString(createResult.content);

		if (doc.response.returncode[0]) {
			// const user = Users.findOneById(this.userId);

			const hookApi = api.urlFor('hooks/create', {
				meetingID,
				callbackURL: Meteor.absoluteUrl(`api/v1/videoconference.bbb.update/${meetingID}`),
				logoutURL: Meteor.absoluteUrl('home'),
			});

			const hookResult = HTTP.get(hookApi);

			if (hookResult.statusCode !== 200) {
				// TODO improve error logging
				console.log({ hookResult });
				return;
			}

			const confArgsJoin = {
				password: 'mp', // mp if moderator ap if attendee
				meetingID,
				attendeePW: true,
				fullName: Meteor.user().name,
				userID: confrid,
				joinViaHtml5: true,
				avatarURL: Meteor.absoluteUrl(`avatar/${Meteor.user().username}`),
			};

			if (customValue && customValue.length > 0) {
				const customValueArr = customValue.split('\n');
				for (let i = 0; i < customValueArr.length; i++) {
					const keyValuePair = customValueArr[i].split('=');
					if (keyValuePair.length > 1) {
						confArgsJoin[keyValuePair[0]] = keyValuePair[1];
					}
				}
			}

			return {
				url: api.urlFor('join', confArgsJoin),
			};
		}
	},

	confEnd({ confrid }) {
		const pw = this.userId && this.userId === confrid ? 'mp' : 'ap';
		const { api } = getBBBAPI();
		const meetingID = settings.get('uniqueID') + confrid;
		const endApi = api.urlFor('end', {
			meetingID,
			password: pw, // mp if moderator ap if attendee
		});

		const endApiResult = HTTP.get(endApi);

		if (endApiResult.statusCode !== 200) {
			// TODO improve error logging
			console.log({ endApiResult });
		}
	},


});
