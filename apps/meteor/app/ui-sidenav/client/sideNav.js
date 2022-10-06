import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { Accounts } from 'meteor/accounts-base';

import { SideNav, menu } from '../../ui-utils';
import { settings } from '../../settings/client';
import { getUserPreference } from '../../utils';
import { Users } from '../../models/client';
import { roomCoordinator } from '../../../client/lib/rooms/roomCoordinator';
import { popover } from '../../ui-utils/client';
import { t } from '../../utils/client';

const newsIntegration = (url, appname) =>
	Meteor.call('getNewsIncomingIntegration', (err, res) => {
		if (err) {
			console.log(err);
		}
		if (res && res.length > 0) {
			const completeToken = `${res[0]._id}/${res[0].token}`;
			const inhookurl = `&inhook=${Meteor.absoluteUrl(`hooks/${completeToken}`)}`;
			const replacedurl = url.replace('&$$newshook$$', inhookurl);
			Session.set('customappname', t(appname));
			Session.set('customurl', replacedurl);
			FlowRouter.go('custom');
			popover.close();
			return;
		}
		const replacedurl = url.replace('&$$newshook$$', '');
		Session.set('customappname', t(appname));
		Session.set('customurl', replacedurl);
		FlowRouter.go('custom');
		popover.close();
	});

const getCustomAppList = () => {
	const customAppConf = settings.get('Custom_App_Domain');
	const customAppList = [];
	try {
		const customAppSettings = JSON.parse(customAppConf);
		for (let index = 0; index < customAppSettings.length; index++) {
			const element = customAppSettings[index];
			// eslint-disable-next-line guard-for-in
			for (const ekey in element) {
				const menuListArray = element[ekey];
				for (let index = 0; index < menuListArray.length; index++) {
					const element = menuListArray[index];
					if (element.roles.includes('all')) {
						customAppList.push({
							icon: 'check',
							name: t(element.name),
							customurl: element.url,
							// eslint-disable-next-line no-loop-func
							// action: () => {
							// 	const replacedurl = element.url.replace('$$auth$$', Accounts._storedLoginToken());
							// 	const newshook = replacedurl.includes('&$$newshook$$');
							// 	if (newshook) {
							// 		newsIntegration(replacedurl, element.name);
							// 	} else {
							// 		Session.set('customappname', t(element.name));
							// 		Session.set('customurl', replacedurl);
							// 		FlowRouter.go('custom');
							// 		popover.close();
							// 	}
							// },
						});
					}
				}
			}
		}
	} catch (error) {
		console.log('error ', error);
	}
	console.log(customAppList);
	return customAppList;
};

Template.sideNav.helpers({
	dataQa() {
		return Template.instance().menuState.get() === 'opened';
	},

	flexTemplate() {
		return SideNav.getFlex().template;
	},

	flexData() {
		return SideNav.getFlex().data;
	},

	roomType() {
		return roomCoordinator.getSortedTypes().map(({ config }) => ({
			template: config.customTemplate || 'roomList',
			data: {
				header: config.header,
				identifier: config.identifier,
				label: config.label,
			},
		}));
	},

	loggedInUser() {
		return !!Meteor.userId();
	},

	sidebarViewMode() {
		const viewMode = getUserPreference(Meteor.userId(), 'sidebarViewMode');
		return viewMode || 'condensed';
	},

	sidebarHideAvatar() {
		return !getUserPreference(Meteor.userId(), 'sidebarDisplayAvatar');
	},

	showAppMenu() {
		return getCustomAppList().length > 0;
	},

	appMenuList() {
		return getCustomAppList();
	},
});

Template.sideNav.events({
	'click .close-flex'() {
		return SideNav.closeFlex();
	},

	'dropped .sidebar'(e) {
		return e.preventDefault();
	},
	'mouseenter .sidebar-item__link'(e) {
		const element = e.currentTarget;
		setTimeout(() => {
			const ellipsedElement = element.querySelector('.sidebar-item__ellipsis');
			const isTextEllipsed = ellipsedElement.offsetWidth < ellipsedElement.scrollWidth;

			if (isTextEllipsed) {
				element.setAttribute('title', element.getAttribute('aria-label'));
			} else {
				element.removeAttribute('title');
			}
		}, 0);
	},
	'click .js-appscollapse'(e) {
		e.preventDefault();
		const aelem = e.currentTarget;
		const expand = aelem.getAttribute('aria-expanded') && aelem.getAttribute('aria-expanded') === 'false';
		aelem.setAttribute('aria-expanded', expand ? 'true' : 'false');
		aelem.setAttribute('class', expand ? 'nav-link js-appscollapse' : 'nav-link collapsed js-appscollapse');
		const celem = e.currentTarget.nextElementSibling;
		celem.setAttribute('class', expand ? 'collapse show' : 'collapse');
	},

	'click .js-applink'(e) {
		const aelem = e.currentTarget;
		const url = aelem.getAttribute('name');
		const title = aelem.getAttribute('title');
		const replacedurl = url.replace('$$auth$$', Accounts._storedLoginToken());
		const newshook = replacedurl.includes('&$$newshook$$');
		if (newshook) {
			newsIntegration(replacedurl, title);
		} else {
			Session.set('customappname', title);
			Session.set('customurl', replacedurl);
			FlowRouter.go('custom');
		}
	},
});

const redirectToDefaultChannelIfNeeded = () => {
	const needToBeRedirect = () => ['/', '/home'].includes(FlowRouter.current().path);

	Tracker.autorun((c) => {
		const firstChannelAfterLogin = settings.get('First_Channel_After_Login');

		if (!needToBeRedirect()) {
			return c.stop();
		}

		if (!firstChannelAfterLogin) {
			return c.stop();
		}

		const room = roomCoordinator.getRoomDirectives('c')?.findRoom(firstChannelAfterLogin);

		if (!room) {
			return;
		}

		c.stop();
		FlowRouter.go(`/channel/${firstChannelAfterLogin}`);
	});
};

Template.sideNav.onRendered(function () {
	SideNav.init();
	menu.init();

	this.stopMenuListener = menu.on('change', () => {
		this.menuState.set(menu.isOpen() ? 'opened' : 'closed');
	});
	redirectToDefaultChannelIfNeeded();
});

Template.sideNav.onDestroyed(function () {
	this.stopMenuListener();
});
Template.sideNav.onCreated(function () {
	this.groupedByType = new ReactiveVar(false);

	this.menuState = new ReactiveVar(menu.isOpen() ? 'opened' : 'closed');

	this.autorun(() => {
		const user = Users.findOne(Meteor.userId(), {
			fields: {
				'settings.preferences.sidebarGroupByType': 1,
			},
		});
		const userPref = getUserPreference(user, 'sidebarGroupByType');
		this.groupedByType.set(userPref || settings.get('UI_Group_Channels_By_Type'));
	});
});

// const redirectToDefaultChannelIfNeeded = () => {
// 	const currentRouteState = FlowRouter.current();
// 	const needToBeRedirect = ['/', '/home'];
// 	const firstChannelAfterLogin = settings.get('First_Channel_After_Login');
// 	const room = roomTypes.findRoom('c', firstChannelAfterLogin, Meteor.userId());
// 	if (room && room._id && needToBeRedirect.includes(currentRouteState.path)) {
// 		FlowRouter.go(`/channel/${firstChannelAfterLogin}`);
// 	}
// };
