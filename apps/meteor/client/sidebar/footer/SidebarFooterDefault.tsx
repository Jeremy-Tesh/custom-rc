import { Box } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { ReactElement } from 'react';

import Search from '../header/actions/Search';
// import colors from '@rocket.chat/fuselage-tokens/colors.json';

const SidebarFooterDefault = (): ReactElement => {
	const t = useTranslation();
	// const sidebarFooterStyle = css`
	// 	& img {
	// 		max-width: 100%;
	// 		height: 100%;
	// 	}

	// 	& a:any-link {
	// 		color: ${colors.n600};
	// 		color: var(--rc-color-primary-light, ${colors.n600});
	// 	}
	// `;

	return (
		<Box>
			{/* <Home title={t('Home')} /> */}
			<Search title={t('Search')} data-qa='sidebar-search' />
		</Box>
	);
};

export default SidebarFooterDefault;
