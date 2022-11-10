import { Box, Grid, Button } from '@rocket.chat/fuselage';
import { Card } from '@rocket.chat/ui-client';
import { useSetting, useTranslation } from '@rocket.chat/ui-contexts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import React, { ReactElement } from 'react';

import { settings } from '../../../app/settings/client';
import Page from '../../components/Page/Page';
import PageScrollableContent from '../../components/Page/PageScrollableContent';
import CustomHomePageContent from './CustomHomePageContent';
import HomePageHeader from './HomePageHeader';
import HomepageGridItem from './HomepageGridItem';

// import AddUsersCard from './cards/AddUsersCard';
// import CreateChannelsCard from './cards/CreateChannelsCard';
// import DesktopAppsCard from './cards/DesktopAppsCard';
// import DocumentationCard from './cards/DocumentationCard';
// import JoinRoomsCard from './cards/JoinRoomsCard';
// import MobileAppsCard from './cards/MobileAppsCard';

// const CREATE_CHANNEL_PERMISSIONS = ['create-c', 'create-p'];

const DefaultHomePage = (): ReactElement => {
	const t = useTranslation();
	// const canAddUsers = usePermission('view-user-administration');
	// const canCreateChannel = useAtLeastOnePermission(CREATE_CHANNEL_PERMISSIONS);
	const workspaceName = useSetting('Site_Name');
	const cardData = JSON.parse(settings.get('Custom_Cards'));

	const handleOpenUsersRoute = (path: string): void => {
		FlowRouter.go(path);
	};

	return (
		<Page data-qa='page-home' data-qa-type='default' background='tint'>
			<HomePageHeader />
			<PageScrollableContent>
				<Box is='h1' fontScale='h1' data-qa-id='homepage-welcome-text'>
					{t('Welcome_to', { Site_Name: 'Collaboration' || workspaceName })}
				</Box>
				<Box is='h3' fontScale='h3' mb='x16'>
					{t('Some_ideas_to_get_you_started')}
				</Box>
				<Grid>
					{/* {canAddUsers && (
						<HomepageGridItem>
							<AddUsersCard />
						</HomepageGridItem>
					)}
					{canCreateChannel && (
						<HomepageGridItem>
							<CreateChannelsCard />
						</HomepageGridItem>
					)} */}
					{Array.isArray(cardData)
						? cardData.map((item) => (
								<HomepageGridItem>
									<Card variant='light' data-qa-id='homepage-add-users-card'>
										<Card.Title>{item.title}</Card.Title>
										<Card.Body>{item.content}</Card.Body>
										<Card.FooterWrapper>
											<Card.Footer>
												{item.actions.map((button: any) => (
													<Button onClick={(): void => handleOpenUsersRoute(button.route)}>{button.text}</Button>
												))}
											</Card.Footer>
										</Card.FooterWrapper>
									</Card>
								</HomepageGridItem>
						  ))
						: null}

					{/* <HomepageGridItem>
						<MobileAppsCard />
					</HomepageGridItem>
					<HomepageGridItem>
						<DesktopAppsCard />
					</HomepageGridItem>
					<HomepageGridItem>
						<DocumentationCard />
					</HomepageGridItem> */}
				</Grid>
				<Box mbs='x16'>
					<CustomHomePageContent />
				</Box>
			</PageScrollableContent>
		</Page>
	);
};

export default DefaultHomePage;
