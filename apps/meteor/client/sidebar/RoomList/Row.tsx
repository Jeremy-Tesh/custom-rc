import { SidebarSection } from '@rocket.chat/fuselage';
import FeatherIcon from 'feather-icons-react';
import React, { ComponentType, memo, useMemo, ReactElement } from 'react';

import { useVideoConfAcceptCall, useVideoConfRejectIncomingCall, useVideoConfIncomingCalls } from '../../contexts/VideoConfContext';
import OmnichannelSection from '../sections/OmnichannelSection';
import SideBarItemTemplateWithData from './SideBarItemTemplateWithData';

const sections: {
	[key: string]: ComponentType<any>;
} = {
	Omnichannel: OmnichannelSection,
};
// function isExpanded(id:string){
// 	if(item.id === openedRoom){

// 	}

// }

// type RoomListRowProps = {
// 	extended: boolean;
// 	t: ReturnType<typeof useTranslation>;
// 	SideBarItemTemplate: ReturnType<typeof useTemplateByViewMode>;
// 	AvatarTemplate: ReturnType<typeof useAvatarTemplate>;
// 	openedRoom: string;
// 	sidebarViewMode: 'extended' | 'condensed' | 'medium';
// 	isAnonymous: boolean;
// };
// const[activeItemId,setActiveItemId] = useState(()=>{

// })

const Row = ({ data, item }: { data: any; item: any }): ReactElement => {
	const { extended, t, SideBarItemTemplate, AvatarTemplate, openedRoom, sidebarViewMode } = data;

	const acceptCall = useVideoConfAcceptCall();
	const rejectCall = useVideoConfRejectIncomingCall();
	const incomingCalls = useVideoConfIncomingCalls();
	const currentCall = incomingCalls.find((call) => call.rid === item.rid);

	const videoConfActions = useMemo(
		() =>
			currentCall && {
				acceptCall: (): void => acceptCall(currentCall.callId),
				rejectCall: (): void => rejectCall(currentCall.callId),
			},
		[acceptCall, rejectCall, currentCall],
	);

	if (typeof item === 'string') {
		const Section = sections[item];
		return Section ? (
			<Section aria-level='1' />
		) : (
			<SidebarSection aria-level='1'>
				<SidebarSection.Title>{t(item)}</SidebarSection.Title>
				<FeatherIcon icon='chevron-down' size='1em' />
			</SidebarSection>
		);
	}

	return (
		<SideBarItemTemplateWithData
			sidebarViewMode={sidebarViewMode}
			selected={item.rid === openedRoom}
			t={t}
			room={item}
			extended={extended}
			SideBarItemTemplate={SideBarItemTemplate}
			AvatarTemplate={AvatarTemplate}
			videoConfActions={currentCall && videoConfActions}
		/>
	);
};

export default memo(Row);
