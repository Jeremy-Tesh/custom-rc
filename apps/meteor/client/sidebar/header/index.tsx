import { Box, Sidebar } from '@rocket.chat/fuselage';
import { useUser, useTranslation } from '@rocket.chat/ui-contexts';
import React, { memo, ReactElement } from 'react';

import { useSidebarPaletteColor } from '../hooks/useSidebarPaletteColor';
import UserAvatarButton from './UserAvatarButton';
import CreateRoom from './actions/CreateRoom';
import Login from './actions/Login';
// import Directory from './actions/Directory';
// import Home from './actions/Home';
// import Search from './actions/Search';
// import Sort from './actions/Sort';

const HeaderWithData = (): ReactElement => {
	const user = useUser();
	const t = useTranslation();
	useSidebarPaletteColor();

	return (
		<Box border={'1px solid #e3ebf6'}>
			<Sidebar.TopBar.Section className='sidebar--custom-colors'>
				<UserAvatarButton />
				<Sidebar.TopBar.Actions>
					{/* <Home title={t('Home')} /> */}
					{/* <Search title={t('Search')} data-qa='sidebar-search' /> */}
					{user && (
						<>
							{/* <Directory title={t('Directory')} />
							<Sort title={t('Display')} /> */}
							<CreateRoom title={t('Create_new')} data-qa='sidebar-create' />
						</>
					)}
					{!user && <Login title={t('Login')} />}
				</Sidebar.TopBar.Actions>
			</Sidebar.TopBar.Section>
		</Box>
	);
};

export default memo(HeaderWithData);
