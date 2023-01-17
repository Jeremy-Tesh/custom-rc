import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Blaze } from 'meteor/blaze';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import { Rooms } from '../../../models';
import { roomTypes } from '../../../utils';
import { t } from '../../../utils';

Template.board.helpers({
	name() {
		return Session.get('board');
	},
	board() {
		return Session.get('boardurl');
	},
});

Template.board.onRendered(() => {
	const boardFrame = document.getElementById('board-iframe');
	const loading = document.getElementsByClassName('loading');
	boardFrame.addEventListener('load', () => {
		boardFrame.style.display = 'block';
		loading[0].style.display = 'none';
	});
});
Template.board.events({
	'click .js-close-vc'(e,inst) {

		// $('.flex-tab').css('max-width', '');
		// $('.main-content').css('right', '');
		// this.tabBar.close();

		const rid = Session.get('openedRoom');
		if (!rid) { FlowRouter.go('/home'); }
		const room = Rooms.findOne({ _id: rid });
		if (!room) { FlowRouter.go('/home'); }
		try {
			if (room.t === 'p') {
				FlowRouter.go(`/group/${ roomTypes.getRoomName(room.t, room) }`);
			} else if (room.t === 'c') {
				FlowRouter.go(`/channel/${ roomTypes.getRoomName(room.t, room) }`);
			} else {
				FlowRouter.go(`/direct/${ roomTypes.getRoomName(room.t, room) }`);
			}
			// const flex = document.querySelector('.flex-tab');
			// if (flex) {
			// 	const templateData = Blaze.getData(flex);
			// 	templateData && templateData.tabBar && templateData.tabBar.close();
			// }		
		} catch (error) {
			FlowRouter.go('/home');
		}
	},
});

Template.openboard.helpers({
});

Template.openboard.onRendered(() => {
	$('.contextual-bar').hide();
	if(Template.instance().tabBar){
		Template.instance().tabBar.close();
	}

    this.rid = Session.get('openedRoom');
    FlowRouter.go(`/board/${ rid }`);
});

Template.opennotes.helpers({
});

Template.opennotes.onRendered(() => {
	$('.contextual-bar').hide();
	// if(Template.instance().tabBar){
	// 	Template.instance().tabBar.close();
	// }
    this.rid = Session.get('openedRoom');
	FlowRouter.go(`/notes/${ rid }`);
});
