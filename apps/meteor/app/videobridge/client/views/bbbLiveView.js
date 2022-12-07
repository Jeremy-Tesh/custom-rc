import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '../../../models';
import { roomCoordinator } from '../../../../client/lib/rooms/roomCoordinator';

// import { APIClient } from '../../../utils/client';
// import { VideoRecorder } from '../../../ui';

Template.bbbLiveView.helpers({
	// content() {
	// 	return Sessions.get('');
	// },
	source() {
		const src = Session.get('source');
		console.log('source...', src);
		return Session.get('source');
	},
	showCloseIcon() {
		return true;
	},
});

Template.bbbLiveView.events({
	'click .js-close-vc'() {
		const rid = Session.get('rid');

		Meteor.call('bbbEnd', { rid });
		// const rid = Session.get('openedRoom');
		if (!rid) {
			FlowRouter.go('/home');
		}
		const room = Rooms.findOne({ _id: rid });
		console.log('room', room);
		const x = roomCoordinator.getRoomName(room.t, room);
		console.log('x', x);

		if (!room) {
			FlowRouter.go('/home');
		}
		try {
			if (room.t === 'p') {
				FlowRouter.go(`/group/${roomCoordinator.getRoomName(room.t, room)}`);
			} else if (room.t === 'c') {
				FlowRouter.go(`/channel/${roomCoordinator.getRoomName(room.t, room)}`);
			} else {
				FlowRouter.go(`/direct/${rid}`);
			}
		} catch (error) {
			// FlowRouter.go('/home');
			console.log(error);
		}
	},
});
