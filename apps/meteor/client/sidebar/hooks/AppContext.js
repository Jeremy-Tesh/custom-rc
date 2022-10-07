import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import React, { useContext, useEffect, useState } from 'react';

import { settings } from '../../../app/settings/client';
import { popover } from '../../../app/ui-utils/client';
import { t } from '../../../app/utils/client';

const AppContext = React.createContext();
const HandleClickContext = React.createContext();

export function useApp() {
	return useContext(AppContext);
}

export function useHandleClick() {
	return useContext(HandleClickContext);
}

export default function AppProvider({ children }) {
	const [apps, setApps] = useState([]);

	function newsIntegration(url, appname) {
		Meteor.call('getNewsIncomingIntegration', (err, res) => {
			if (err) {
				console.log(err);
			}
			if (res && res.length > 0) {
				// const completeToken = `${res[0]._id}/${res[0].token}`;
				// const inhookurl = `&inhook=${Meteor.absoluteUrl(`hooks/${completeToken}`)}`;
				// const replacedurl = url.replace('&$$newshook$$', inhookurl);
				Session.set('customappname', t(appname));
				Session.set('customurl', url);
				FlowRouter.go('custom');
				popover.close();
				return;
			}
			// const replacedurl = url.replace('&$$newshook$$', '');
			Session.set('customappname', t(appname));
			Session.set('customurl', url);
			FlowRouter.go('custom');
			popover.close();
		});
	}

	function handleClick(e) {
		const aelem = e.currentTarget;
		const url = aelem.getAttribute('data-name');
		const title = aelem.getAttribute('data-title');
		// const replacedurl = url.replace('$$auth$$', Accounts._storedLoginToken());
		// const newshook = replacedurl.includes('&$$newshook$$');
		console.log(url, title);
		if (url) {
			newsIntegration(url, title);
		} else {
			Session.set('customappname', title);
			Session.set('customurl', url);
			FlowRouter.go('custom');
		}
	}

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
	}, [settings.get('Custom_App_Domain')]);

	return (
		<AppContext.Provider value={apps}>
			<HandleClickContext.Provider value={handleClick}>{children}</HandleClickContext.Provider>
		</AppContext.Provider>
	);
}
