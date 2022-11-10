import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

// import { APIClient } from '../../../utils/client';
// import { VideoRecorder } from '../../../ui';

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
	'click .js-close-vc'() {
		// const rid = Session.get('openedRoom');
		// BBBMethods.bbbEnd({ rid });
	},
});
