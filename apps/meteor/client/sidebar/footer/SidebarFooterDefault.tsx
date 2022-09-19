import { css } from '@rocket.chat/css-in-js';
import { Sidebar } from '@rocket.chat/fuselage';
import Search from '../header/actions/Search';
import colors from '@rocket.chat/fuselage-tokens/colors.json';
import React, { ReactElement } from 'react';

// import { settings } from '../../../app/settings/client';
// import { SidebarFooterWatermark } from '../../../ee/client/sidebar/footer/SidebarFooterWatermark';
import { useTranslation } from '@rocket.chat/ui-contexts';

const SidebarFooterDefault = (): ReactElement => {
	const t = useTranslation();
	const sidebarFooterStyle = css`
		& img {
			max-width: 100%;
			height: 100%;
		}

		& a:any-link {
			color: ${colors.n600};
			color: var(--rc-color-primary-light, ${colors.n600});
		}
	`;

	return (
		<>
			<Sidebar.TopBar.Section className='sidebar--custom-colors'>
				<Sidebar.TopBar.Actions>
					{/* <Home title={t('Home')} /> */}
					<Search title={t('Search')} data-qa='sidebar-search' />
				</Sidebar.TopBar.Actions>
			</Sidebar.TopBar.Section>
		</>
	);
};

export default SidebarFooterDefault;
