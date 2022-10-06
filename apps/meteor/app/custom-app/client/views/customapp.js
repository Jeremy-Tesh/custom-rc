// import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '../../../models';
import { roomTypes } from '../../../utils';

Template.customapp.helpers({
	name() {
		return Session.get('customappname');
	},
	customurl() {
		// console.log(login.user);
		return Session.get('customurl');
	},
	showCloseIcon() {
		return true;
	},
});

Template.customapp.events({
	'click .js-close-vc'() {
		const rid = Session.get('openedRoom');
		if (!rid) {
			FlowRouter.go('/home');
		}
		const room = Rooms.findOne({ _id: rid });
		if (!room) {
			FlowRouter.go('/home');
		}
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
