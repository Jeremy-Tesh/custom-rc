import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tracker } from 'meteor/tracker';
import { settings } from '../../../settings';
import { roomTypes } from '../../../utils';
import { Rooms } from '../../../models';

Template.confTcsRoom.onCreated(function () {

	Meteor.call('createTcsConf', { confrid: Session.get('confroomid'), name: Session.get('confuname') }, function (err, res) {
		if (res) {
			window.location = res.url;
		}
	});
});

Template.confOwnRoom.onCreated(function () {
	const rocketChat = document.getElementById('rocket-chat');
	const asideTag = rocketChat.getElementsByTagName('aside');
	asideTag[0].style.setProperty('display', 'none');
	const self = this;
	self.ownconf = new ReactiveVar();
	return Meteor.call('createJoinConf', { confrid: Meteor.userId() }, function (error, result) {
		Session.set('confURL', result.url);
		self.ownconf.set({
			ready: true,
			url: result.url,
		});
	});
});


Template.confVideoTemplate.onRendered(() => {
	const iFrame = document.getElementById('confChatUrl');
	iFrame.addEventListener('load', (event) => {
		const getVcId = iFrame.contentDocument || iFrame.contentWindow.document;
		if (getVcId.location.href === Meteor.absoluteUrl('home')) {
			const rocketChat = document.getElementById('rocket-chat');
			const asideTag = rocketChat.getElementsByTagName('aside');
			asideTag[0].style.setProperty('display', 'block');
			const rid = Session.get('openedRoom');
			if (!rid) { FlowRouter.go('/home'); }
			const room = Rooms.findOne({ _id: rid });
			if (!room) { FlowRouter.go('/home'); }
			try {
				if (room.t === 'p') {
					FlowRouter.go(`/group/${roomTypes.getRoomName(room.t, room)}`);
				} else if (room.t === 'c') {
					FlowRouter.go(`/channel/${roomTypes.getRoomName(room.t, room)}`);
				} else {
					FlowRouter.go(`/direct/${rid}`);
				}
			} catch (error) {
				FlowRouter.go('/home');
			}
		}
	});
});

Template.confVideoTemplate.helpers({
	bbburl() {
		const temp = Session.get('confURL');
		if (temp) {
			return temp;
		}
		return '';
	},

});

Template.confOwnRoom.helpers({
	name() {
		// const rid = Session.get('bbbvcrid');
		const title = 'Conference Room';
		// if (rid) {
		// 	const room = Rooms.findOne({ _id: rid });
		// 	if (room) { title = `${ room.name } - ${ title }`; }
		// }

		return title;
	},

	ownconfready() {
		const temp = Template.instance().ownconf.get();
		if (temp && temp.ready) {
			return temp.ready;
		}
		return false;
	},


	getConf() {
		Template.instance().ownconf.get();
	},

	showCloseIcon() {
		return true;
	},
});

Template.confOwnRoom.events({
	'click .js-close-vc'() {
		Meteor.call('confEnd', { confrid: Meteor.userId() });
		const rocketChat = document.getElementById('rocket-chat');
		const asideTag = rocketChat.getElementsByTagName('aside');
		asideTag[0].style.setProperty('display', 'block');
		const rid = Session.get('openedRoom');
		if (!rid) { FlowRouter.go('/home'); }
		const room = Rooms.findOne({ _id: rid });
		if (!room) { FlowRouter.go('/home'); }
		try {
			if (room.t === 'p') {
				FlowRouter.go(`/group/${roomTypes.getRoomName(room.t, room)}`);
			} else if (room.t === 'c') {
				FlowRouter.go(`/channel/${roomTypes.getRoomName(room.t, room)}`);
			} else {
				FlowRouter.go(`/direct/${roomTypes.getRoomName(room.t, room)}`);
			}
		} catch (error) {
			FlowRouter.go('/home');
		}
	},
});

const joinConf = () => {
	Meteor.call('joinConf', { confrid: Session.get('confroomid'), name: Session.get('confuname') }, function (err, res) {
		if (res) {
			window.location = res.url;
		}
	});
};

const updateVideoUrl = () => {
	if (Session.get('confuname') && Session.get('callstarted') === 'false') {
		Meteor.call('createConf', { confrid: Session.get('confroomid'), name: Session.get('confroom') }, function (error, result) {
			if (result && result[0] === 'true') {
				// Session.set('callstarted', 'true');
				joinConf();
			}
		});
	}
};


Template.confCustomer.onCreated(function () {
	const self = this;
	self.user = new ReactiveVar();
	self.username = new ReactiveVar();
	Session.set('callstarted', 'false');

	Tracker.autorun(updateVideoUrl);

	setInterval(updateVideoUrl, 3000);

	// Users.findOneByUsernameIgnoringCase(
	// return Meteor.call('getConfroomDetails', { confroom: Session.get('confroom') }, function(error, userobj) {
	// 	self.user.set({
	// 		ready: true,
	// 		userobj,
	// 	});
	// 	return Meteor.defer(() => self.find('input').focus());
	// });
});


Template.confCustomer.helpers({
	title() {
		return `${Session.get('confroom')}'s conference room`;
	},

	desc() {
		const temp = Template.instance().username.get();
		if (Session.get('callstarted') === 'true') {
			return 'Call Started';
		}

		if (temp && temp.username) {
			return 'Please wait till conference starts';
		}
		return 'Enter your name to Join';
	},

	username() {
		return Template.instance().username.get();
	},


	isNameEnter() {
		const temp = Template.instance().username.get();
		if (temp && temp.username) {
			return false;
		}
		return true;
	},

	isCallStarted() {
		return Session.get('callstarted') === 'true';
	},

	backgroundUrl() {
		const asset = settings.get('Assets_background');
		const prefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || '';
		if (asset && (asset.url || asset.defaultUrl)) {
			return `${prefix}/${asset.url || asset.defaultUrl}`;
		}
	},
});

Template.confCustomer.events({

	'click .enterconf'(event) {
		event.preventDefault();
		const value = $('#username').val().trim();
		if (value === '') {
			Template.instance().username.set({
				empty: true,
				username: '',
			});
			return;
		}
		Template.instance().username.set({
			empty: false,
			username: value,
		});
		Session.set('confuname', value);
		Session.set('callstarted', 'false');
		Meteor.call('sendConfWaitingMsg', { userid: Session.get('confroomid'), waitername: Session.get('confuname') }, function () {
		});
	},

	'click .joincall'(event) {
		event.preventDefault();
		Meteor.call('joinConf', { confrid: Session.get('confroomid'), name: Session.get('confuname') }, function (err, res) {
			if (res) {
				window.location = res.url;
			}
		});
	},

});
