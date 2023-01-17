import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

import { hasRole } from '../../authorization';
import { settings } from '../../settings';
import * as TabBar from '../../ui-message/client/actionButtons/tabbar';
import { Rooms } from '../../models';


Meteor.startup(function() {
	Tracker.autorun(function() {
        var groups = ['direct','group'];
        const rid = Session.get('openedRoom');
		if (!hasRole(Meteor.userId(), 'customer') && settings.get('Board_Enabled') && rid && Rooms.findOne(rid)) {
            const type = Rooms.findOne(rid).t;
            if (type && type === 'c') {
                groups.push('channel');
            }
            TabBar.onAdded({
				groups,
				id: 'open-board',
				i18nTitle: 'Task_Board',
				icon: 'taskboard',
				template: 'openboard',
				order: 0,
			});
        } else {
            return TabBar.onRemoved('open-board');
        }
    });

	Tracker.autorun(function() {
        var groups = [];
        const rid = Session.get('openedRoom');
        if (!hasRole(Meteor.userId(), 'customer') && settings.get('Notes_Enabled') && rid && Rooms.findOne(rid)) {
            const type = Rooms.findOne(rid).t;
            if (type && type === 'p' && settings.get('Notes_Private_Enabled')) {
                groups.push('group');
            }
            if (type && type === 'c' && settings.get('Notes_Public_Enabled')) {
                groups.push('channel');
            }
            if (type && type === 'd' && settings.get('Notes_Direct_Enabled')) {
                groups.push('direct');
            }
            TabBar.onAddded({
				groups,
				id: 'open-notes',
				i18nTitle: 'Notes',
				icon: 'note',
				template: 'opennotes',
				order: 0,
			});
        } else {
            return TabBar.onRemoved('open-notes');
        }
    });

});
