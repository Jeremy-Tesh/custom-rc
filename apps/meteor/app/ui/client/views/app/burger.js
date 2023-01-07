import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import { ChatSubscription } from '../../../../models/client';
import { Layout } from '../../../../ui-utils/client';
import { getUserPreference } from '../../../../utils';

Template.burger.helpers({
	unread() {
		const userUnreadAlert = getUserPreference(Meteor.userId(), 'unreadAlert');
		const [unreadCount, unreadAlert] = ChatSubscription.find(
			{
				open: true,
				hideUnreadStatus: { $ne: true },
				rid: { $ne: Session.get('openedRoom') },
			},
			{
				fields: {
					unread: 1,
					alert: 1,
					unreadAlert: 1,
				},
			},
		)
			.fetch()
			.reduce(
				([unreadCount, unreadAlert], { alert, unread, unreadAlert: alertType }) => {
					if (alert || unread > 0) {
						unreadCount += unread;
						if (alert === true && alertType !== 'nothing') {
							if (alertType === 'all' || userUnreadAlert !== false) {
								unreadAlert = '•';
							}
						}
					}

					return [unreadCount, unreadAlert];
				},
				[0, false],
			);

		if (unreadCount > 0) {
			return unreadCount > 99 ? '99+' : unreadCount;
		}

		return unreadAlert || '';
	},

	isMenuOpen() {
		if (Session.equals('isMenuOpen', true)) {
			return true;
		}
		return false;
	},
	embeddedVersion() {
		return Layout.isEmbedded();
	},
});

Template.burger.events({
	'click .rc-old-burger'(e) {
		const rocketChat = document.getElementById('rocket-chat');
		const asideTag = rocketChat.getElementsByTagName('aside');
		if (asideTag[0].style.getPropertyValue('display') !== 'none') {
			if (screen.width < 1000) {
				asideTag[0].style.setProperty('display', 'block');
			} else {
				asideTag[0].style.setProperty('display', 'none');
			}
		} else {
			asideTag[0].style.removeProperty('display');
		}
		const ToLeftIcon = `
        <svg width="1em" style="color:gray" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left ">
                <g>
                    <polyline points="15 18 9 12 15 6"></polyline>
                </g>
            </svg>`;
		const ToRightIcon = `
        <svg width="1em" style="color:gray" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right ">
                <g>
                    <polyline points="9 18 15 12 9 6"></polyline>
                </g>
            </svg>`;
		if (asideTag[0].style.getPropertyValue('display') === 'none') {
			$(e.currentTarget).find('svg').remove();
			$(e.currentTarget).find('a').append(ToRightIcon);
		} else {
			$(e.currentTarget).find('svg').remove();
			$(e.currentTarget).find('a').append(ToLeftIcon);
		}
	},
});
