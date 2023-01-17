// import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';

import { Rooms, ChatSubscription } from '../../../models';
import { roomTypes } from '../../../utils';
import { mime } from '../../../utils/lib/mimeTypes';
import { fileUpload } from '../../../ui';
import { settings } from '../../../settings';

Template.customupload.helpers({
	rooms() {
		// console.log(Rooms.find({ t: ['c', 'p', 'd'] }, { sort: { lm: -1 } }));
		// return Rooms.find({ t: ['c', 'p', 'd'] }, { sort: { lm: -1 } });
		const query = {
			open: true,
		};

		const sort = {};
		sort.lm = -1;
		const types = ['c', 'p', 'd'];
		query.t = { $in: types };
		return ChatSubscription.find(query, { sort });
	},

	isroom() {
		const rid = Template.instance().roomid.get();
		return rid && rid !== '-1';
	},

	getrid() {
		return {
			label: 'Files',
			icon: 'clip',
			rid: Template.instance().roomid.get(),
		};
	},
	roomName() {
		return Template.instance().roomName.get();
	},
});

Template.customapp.helpers({
	name() {
		return Session.get('customappname');
	},
	isUpload() {
		const upload = Session.get('customupload');
		// eslint-disable-next-line eqeqeq
		if (upload && upload == 'true') {
			return true;
		}
		return false;
	},
	customurl() {
		// console.log(login.user);
		return Session.get('customurl');
	},
	showCloseIcon() {
		return true;
	},
});

Template.customupload.onCreated(function() {
	const instance = this;
	instance.roomid = new ReactiveVar('-1');
	instance.roomName = new ReactiveVar('Select a room');
});

Template.customupload.onDestroyed(function() {
});

Template.customupload.events({
	'click .js-roomaction'(e, i) {
		e.preventDefault();
		i.roomid.set('-1');
		const aelem = e.currentTarget;
		const roomId = aelem.getAttribute('roomid');
		const rname = aelem.getAttribute('roomname');
		i.roomid.set(roomId);
		i.roomName.set(rname);
		const celem = aelem.parentElement;
		celem.setAttribute('class', 'dropdown-menu');
		const belem = celem.previousElementSibling;
		belem.setAttribute('aria-expanded', 'false');
	},
	'click .js-roomcollapse'(e) {
		e.preventDefault();
		const aelem = e.currentTarget;
		const expand = aelem.getAttribute('aria-expanded') && aelem.getAttribute('aria-expanded') === 'false';
		aelem.setAttribute('aria-expanded', expand ? 'true' : 'false');
		// aelem.setAttribute('class', expand ? 'nav-link js-appscollapse' : 'nav-link collapsed js-appscollapse');
		const celem = e.currentTarget.nextElementSibling;
		celem.setAttribute('class', expand ? 'dropdown-menu show' : 'dropdown-menu');
	},
	'click .js-upload'(e, i) {
		e.preventDefault();
		const $input = $(document.createElement('input'));
		$input.css('display', 'none');
		$input.attr({
			id: 'fileupload-input',
			type: 'file',
			multiple: 'multiple',
		});
		$(document.body).append($input);

		$input.one('change', function(e) {
			const filesToUpload = [...e.target.files].map((file) => {
				Object.defineProperty(file, 'type', {
					value: mime.lookup(file.name),
				});
				return {
					file,
					name: file.name,
				};
			});
			const rid = i.roomid.get();
			fileUpload(filesToUpload, null, { rid });
			$input.remove();
		});

		$input.click();

		// Simple hack for iOS aka codegueira
		if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
			$input.click();
		}
	},
});

Template.customapp.onCreated(function() {
});

Template.customapp.onDestroyed(function() {
});

Template.customapp.events({

	'click .js-close-vc'() {
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
		} catch (error) {
			FlowRouter.go('/home');
		}
	},
	'click .js-open-upload'() {
		// const screenX = typeof window.screenX !== 'undefined' ? window.screenX : window.screenLeft;
		// const screenY = typeof window.screenY !== 'undefined' ? window.screenY : window.screenTop;
		const outerWidth = typeof window.outerWidth !== 'undefined' ? window.outerWidth : document.body.clientWidth;
		// const outerHeight = typeof window.outerHeight !== 'undefined' ? window.outerHeight : document.body.clientHeight - 22;
		// XXX what is the 22?

		// Use `outerWidth - width` and `outerHeight - height` for help in
		// positioning the popup centered relative to the current window
		const left = outerWidth - 350;
		const top = 100;
		const features = `width=${ 300 },height=${ 600 },left=${ left },top=${ top },scrollbars=yes`;

		const newwindow = window.open(`${ settings.get('Site_Url') }/customupload?layout=embedded`, '', features);
	},
});
