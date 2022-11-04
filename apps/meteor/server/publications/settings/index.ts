import { Meteor } from 'meteor/meteor';
import type { ISetting } from '@rocket.chat/core-typings';
import { Settings } from '@rocket.chat/models';

import { hasPermission, hasAtLeastOnePermission } from '../../../app/authorization/server';
import { getSettingPermissionId } from '../../../app/authorization/lib';
import { SettingsEvents } from '../../../app/settings/server';

Meteor.methods({
	async 'public-settings/get'(updatedAt) {
		if (updatedAt instanceof Date) {
			const records = await Settings.findNotHiddenPublicUpdatedAfter(updatedAt).toArray();
			SettingsEvents.emit('fetch-settings', records);

			return {
				update: records,
				remove: await Settings.trashFindDeletedAfter(
					updatedAt,
					{
						hidden: {
							$ne: true,
						},
						public: true,
					},
					{
						projection: {
							_id: 1,
							_deletedAt: 1,
						},
					},
				).toArray(),
			};
		}

		const publicSettings = (await Settings.findNotHiddenPublic().toArray()) as ISetting[];
		SettingsEvents.emit('fetch-settings', publicSettings);

		return publicSettings;
	},
	async 'mobile-settings/get'(updatedAt) {
		if (updatedAt instanceof Date) {
			const records = await Settings.findNotHiddenPublicUpdatedAfter(updatedAt).toArray();
			return {
				update: records,
				remove: await Settings.trashFindDeletedAfter(
					updatedAt,
					{
						hidden: {
							$ne: true,
						},
						public: true,
					},
					{
						projection: {
							_id: 1,
							_deletedAt: 1,
						},
					},
				).toArray(),
			};
		}
		const keys = [
			'uniqueID',
			'Team_Group_Name',
			'Client_Group_Name',
			'Accounts_',
			'Enabled_',
			'user_',
			'MGBoard_',
			'Message_',
			'Site_',
			'Mongrov_',
			'MGVC_',
			'bigbluebutton_enable',
			'FileUpload_',
			'Board_',
			'Hide_',
			'RetentionPolicy_',
			'WebRTC_',
			'Threads_',
			'Language',
			'Discussion_',
			'SMS_',
			'Image_Proxy_',
			'vertiv_',
			'Accounts_OAuth_Custom',
		];
		const mobilesettings: ISetting[] = [];
		const publicSettings = (await Settings.findNotHiddenPublic().toArray()) as ISetting[];
		publicSettings.forEach((setting) => {
			const index = keys.findIndex(function (element) {
				return setting._id.startsWith(element.toString());
			});
			if (index) {
				mobilesettings.push(setting);
			}
		});
		return mobilesettings;
		// return settings.findNotHiddenPublic(keys).fetch();
	},

	async 'private-settings/get'(updatedAfter) {
		const uid = Meteor.userId();

		if (!uid) {
			return [];
		}

		const privilegedSetting = hasAtLeastOnePermission(uid, ['view-privileged-setting', 'edit-privileged-setting']);
		const manageSelectedSettings = privilegedSetting || hasPermission(uid, 'manage-selected-settings');

		if (!manageSelectedSettings) {
			return [];
		}

		const bypass = <T>(settings: T): T => settings;

		const applyFilter = <T extends any[], U>(fn: (args: T) => U, args: T): U => fn(args);

		const getAuthorizedSettingsFiltered = (settings: ISetting[]): ISetting[] =>
			settings.filter((record) => hasPermission(uid, getSettingPermissionId(record._id)));

		const getAuthorizedSettings = async (updatedAfter: Date, privilegedSetting: boolean): Promise<ISetting[]> =>
			applyFilter(
				privilegedSetting ? bypass : getAuthorizedSettingsFiltered,
				await Settings.findNotHidden(updatedAfter && { updatedAfter }).toArray(),
			);

		if (!(updatedAfter instanceof Date)) {
			// this does not only imply an unfiltered setting range, it also identifies the caller's context:
			// If called *with* filter (see below), the user wants a collection as a result.
			// in this case, it shall only be a plain array
			return getAuthorizedSettings(updatedAfter, privilegedSetting);
		}

		return {
			update: await getAuthorizedSettings(updatedAfter, privilegedSetting),
			remove: await Settings.trashFindDeletedAfter(
				updatedAfter,
				{
					hidden: {
						$ne: true,
					},
				},
				{
					projection: {
						_id: 1,
						_deletedAt: 1,
					},
				},
			).toArray(),
		};
	},
});
