import { css } from '@rocket.chat/css-in-js';
import { Box, Divider, Dropdown, Icon, SidebarSection } from '@rocket.chat/fuselage';
import { useResizeObserver, useMutableCallback } from '@rocket.chat/fuselage-hooks';
import { useSession, useUserPreference, useUserId, useTranslation, useRoute } from '@rocket.chat/ui-contexts';
import FeatherIcon from 'feather-icons-react';
import React, { useMemo, ReactElement, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import SortList from '../../components/SortList/SortList';
import { useDropdownVisibility } from '../header/hooks/useDropdownVisibility';
import { useApp, useHandleClick } from '../hooks/AppContext';
import { useAvatarTemplate } from '../hooks/useAvatarTemplate';
import { usePreventDefault } from '../hooks/usePreventDefault';
import { useRoomList } from '../hooks/useRoomList';
import { useShortcutOpenMenu } from '../hooks/useShortcutOpenMenu';
import { useSidebarPaletteColor } from '../hooks/useSidebarPaletteColor';
import { useTemplateByViewMode } from '../hooks/useTemplateByViewMode';
import RoomItems from './RoomItems';
// import Row from './Row';
// import ScrollerWithCustomProps from './ScrollerWithCustomProps';
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
	const app = useApp();
	const handleClick = useHandleClick();

	// const[roomsdata,setroomsData]= useDebouncedState<Type[]>(()=>{
	// 	return roomsList.map((elt) => {
	// 		return setroomsData(Object.values(elt))
	// 	})
	// },100)
	console.log(app);
	console.log(handleClick);

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

	const [open, setOpen] = useState(false);

	const homeRoute = useRoute('home');
	const adminRoute = useRoute('admin-index');

	const reference = useRef(null);
	const target = useRef(null);
	const { isVisible, toggle } = useDropdownVisibility({ reference, target });

	const handleHome = useMutableCallback(() => {
		homeRoute.push({});
	});

	const handleAdmin = useMutableCallback(() => {
		adminRoute.push();
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
			<Box onClick={() => setOpen(!open)} className={itemStyle} justifyContent='space-between'>
				<div style={{ display: 'flex' }}>
					<Icon padding='0px 10px 0px 0px' name='squares' size='x16' />
					<SidebarSection.Title>Apps</SidebarSection.Title>
				</div>

				<FeatherIcon icon={open ? 'chevron-up' : 'chevron-down'} size='1em' />
			</Box>

			{open && (
				<div style={{ height: 'auto', padding: '20px 24px 0px 24px' }}>
					{app.map((item: any, index: number) => (
						<Box className={itemStyle} key={index} data-title={item.name} data-name={item.customurl} onClick={handleClick}>
							{item.name}
						</Box>
					))}
				</div>
			)}

			<Box padding='10px 0px 0px 0px' className={itemStyle} onClick={(): void => toggle()} ref={reference}>
				<Icon name='sort' padding='0px 10px 0px 0px' size='x16' />
				<SidebarSection.Title>Sort</SidebarSection.Title>
			</Box>
			{isVisible &&
				createPortal(
					<Dropdown reference={reference} ref={target}>
						<SortList />
					</Dropdown>,
					document.body,
				)}
			<Box className={itemStyle} onClick={handleAdmin}>
				<Icon name='customize' padding='0px 10px 0px 0px' size='x16' />
				<SidebarSection.Title>Administration</SidebarSection.Title>
			</Box>
		</Box>
	);
};

export default RoomList;
