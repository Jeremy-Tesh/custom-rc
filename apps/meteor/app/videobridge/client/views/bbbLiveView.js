import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Rooms } from '../../../models';
import { roomCoordinator } from '../../../../client/lib/rooms/roomCoordinator';

Template.bbbLiveView.helpers({
	source() {
		const src = Session.get('source');
		console.log('source...', src);
		return Session.get('source');
	},
	showCloseIcon() {
		return true;
	},
	showChatRoom() {
		return true;
	},
	chaturl() {
		const rid = Session.get('rid');
		const room = Rooms.findOne({ _id: rid });

		if (room.t === 'p') {
			return Meteor.absoluteUrl(`/group/${roomCoordinator.getRoomName(room.t, room)}?layout=embedded`);
		}
		if (room.t === 'c') {
			return Meteor.absoluteUrl(`/channel/${roomCoordinator.getRoomName(room.t, room)}?layout=embedded`);
		}
		return Meteor.absoluteUrl(`/direct/${rid}?layout=embedded`);
	},
});

Template.bbbLiveView.events({
	'click .js-close-vc'() {
		const rid = Session.get('rid');

		Meteor.call('bbbEnd', { rid });
		if (!rid) {
			FlowRouter.go('/home');
		}
		const room = Rooms.findOne({ _id: rid });

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
			// console.log(error);
		}
	},
	'click .chat'() {
		if (document.getElementById('confChat').style.display === 'none') {
			document.getElementById('confChat').style.display = 'inline-block';
			document.getElementById('videConf').style.width = '75%';
			document.getElementById('Capa_1').setAttribute('fill', '#00b8ff');
		} else {
			document.getElementById('confChat').style.display = 'none';
			document.getElementById('videConf').style.width = '100%';
			document.getElementById('Capa_1').setAttribute('fill', '#fff');
		}
	},
});
