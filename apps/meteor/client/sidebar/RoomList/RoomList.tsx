import { Box, Divider, Icon, SidebarSection } from '@rocket.chat/fuselage';
import { useResizeObserver, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { css } from '@rocket.chat/css-in-js';
import { useSession, useUserPreference, useUserId, useTranslation, useRoute } from '@rocket.chat/ui-contexts';

import React, { useMemo, ReactElement } from 'react';

import { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { usePreventDefault } from '../hooks/usePreventDefault';
import { useRoomList } from '../hooks/useRoomList';
import { useShortcutOpenMenu } from '../hooks/useShortcutOpenMenu';
import { useSidebarPaletteColor } from '../hooks/useSidebarPaletteColor';
import { useTemplateByViewMode } from '../hooks/useTemplateByViewMode';
// import Row from './Row';
// import ScrollerWithCustomProps from './ScrollerWithCustomProps';
import RoomItems from './RoomItems';

// import Sidebar from '/client/components/Sidebar';

// const computeItemKey = (index: number, room: IRoom): IRoom['_id'] | number => room._id || index;

const RoomList = (): ReactElement => {
	useSidebarPaletteColor();

	const { ref } = useResizeObserver({ debounceDelay: 100 });

	const openedRoom = (useSession('openedRoom') as string) || '';

	const sidebarViewMode = useUserPreference<'extended' | 'medium' | 'condensed'>('sidebarViewMode') || 'extended';
	const sideBarItemTemplate = useTemplateByViewMode();
	const avatarTemplate = useAvatarTemplate();
	const extended = sidebarViewMode === 'extended';
	const isAnonymous = !useUserId();

	const t = useTranslation();

	const roomsList = useRoomList();
	// const[roomsdata,setroomsData]= useDebouncedState<Type[]>(()=>{
	// 	return roomsList.map((elt) => {
	// 		return setroomsData(Object.values(elt))
	// 	})
	// },100)

	const itemData = useMemo(
		() => ({
			extended,
			t,
			SideBarItemTemplate: sideBarItemTemplate,
			AvatarTemplate: avatarTemplate,
			openedRoom,
			sidebarViewMode,
			isAnonymous,
		}),
		[avatarTemplate, extended, isAnonymous, openedRoom, sideBarItemTemplate, sidebarViewMode, t],
	);

	const homeRoute = useRoute('home');
	const handleHome = useMutableCallback(() => {
		homeRoute.push({});
	});

	usePreventDefault(ref);
	useShortcutOpenMenu(ref);

	const itemStyle = css`
		cursor: pointer;
		display: flex;
		padding: 10px 0px;
	`;

	return (
		<Box h='full' w='full' p='20px' overflowY='auto' ref={ref}>
			<Box className={itemStyle} onClick={handleHome}>
				<Icon padding='0px 10px 0px 0px' name='home' size='x16' />
				<SidebarSection.Title>Home</SidebarSection.Title>
			</Box>
			<Divider />

			{roomsList.map((item, index) => {
				const entries = Object.entries(item);

				const title = entries[0][0];
				const list = entries[0][1];

				return <RoomItems key={index} list={list} title={title} itemData={itemData} />;
			})}

			<Divider />
			<Box className={itemStyle}>
				<Icon padding='0px 10px 0px 0px' name='squares' size='x16' />
				<SidebarSection.Title>Apps</SidebarSection.Title>
			</Box>
			<Box className={itemStyle}>
				<Icon name='info-circled' padding='0px 10px 0px 0px' size='x16' />
				<SidebarSection.Title>Help</SidebarSection.Title>
			</Box>
		</Box>
	);
};

export default RoomList;
