// import { FlowRouter } from 'meteor/kadira:flow-router';
// import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { useEffect, useState } from 'react';

import { settings } from '../../../app/settings/client';
// import { popover } from '../../../app/ui-utils/client';
import { t } from '../../../app/utils/client';

export const useApps = () => {
	// const data = [
	// 	{
	// 		articles: [
	// 			{
	// 				name: 'News',
	// 				url: 'www.google.com',
	// 				roles: ['all'],
	// 			},

	// 			{
	// 				name: 'User Engagement',
	// 				url: 'www.google.com',
	// 				roles: ['all'],
	// 			},
	// 			{
	// 				name: 'Attendance',
	// 				url: 'www.google.com',
	// 				roles: ['admin'],
	// 			},
	// 		],
	// 	},
	// ];

	const [apps, setApps] = useState([]);

	// const newsIntegration = (url, appname) =>{
	// 	Meteor.call('getNewsIncomingIntegration', (err, res) => {
	// 		if (err) {
	// 			console.log(err);
	// 		}
	// 		if (res && res.length > 0) {
	// 			const completeToken = `${res[0]._id}/${res[0].token}`;
	// 			const inhookurl = `&inhook=${Meteor.absoluteUrl(`hooks/${completeToken}`)}`;
	// 			const replacedurl = url.replace('&$$newshook$$', inhookurl);
	// 			Session.set('customappname', t(appname));
	// 			Session.set('customurl', replacedurl);
	// 			FlowRouter.go('custom');
	// 			popover.close();
	// 			return;
	// 		}
	// 		const replacedurl = url.replace('&$$newshook$$', '');
	// 		Session.set('customappname', t(appname));
	// 		Session.set('customurl', replacedurl);
	// 		FlowRouter.go('custom');
	// 		popover.close();
	// 	});
	// }

	useEffect(() => {
		const getCustomAppList = () => {
			const customAppConf = settings.get('Custom_App_Domain');
			const customAppList = [];

			try {
				const customAppSettings = JSON.parse(customAppConf);
				if (customAppSettings) {
					for (let index = 0; index < customAppSettings.length; index++) {
						const element = customAppSettings[index];
						for (const ekey in element) {
							if (element.hasOwnProperty(ekey)) {
								const menuListArray = element[ekey];
								for (let index = 0; index < menuListArray.length; index++) {
									const element = menuListArray[index];
									if (element.roles.includes('all')) {
										customAppList.push({
											icon: 'check',
											name: t(element.name),
											customurl: element.url,
											// action: () => {
											// 	const replacedurl = element.url.replace('&$$newshook$$', '');
											// 	const newshook = replacedurl.includes('&$$newshook$$');
											// 	if (newshook) {
											// 		newsIntegration(replacedurl, element.name);
											// 	} else {
											// 		Session.set('customappname', t(appname));
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
					}
				}
			} catch (error) {
				console.log('error', error);
			}
			setApps(customAppList);
		};
		getCustomAppList();
	}, []);

	return apps;
};
