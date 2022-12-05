import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { roomTypes } from '../../../utils';
import { Rooms } from '../../../models';

// import { APIClient } from '../../../utils/client';
// import { VideoRecorder } from '../../../ui';

Template.bbbLiveView.helpers({
	// content() {
	// 	return Sessions.get('');
	// },
	source() {
		console.log('source...', Session.get('source'));
		return Session.get('source');
	},
	showCloseIcon() {
		return true;
	},
});

Template.bbbLiveView.events({
	'click .js-close-vc'() {
		const rid = Session.get('rid');

		Meteor.call('confEnd', { rid });
		// const rid = Session.get('openedRoom');
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
