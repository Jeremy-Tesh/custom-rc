import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

Template.bbbLiveView.helpers({
	// content() {
	// 	return Sessions.get('');
	// },
	source() {
		return Session.get('source');
	},
	showCloseIcon() {
		return true;
	},
});

Template.customapp.events({
	'click .js-close-vc'() {},
});
