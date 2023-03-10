import { Dropdown, Box, Icon } from '@rocket.chat/fuselage';
import { useAtLeastOnePermission } from '@rocket.chat/ui-contexts';
import React, { HTMLAttributes, useRef, VFC } from 'react';
import { createPortal } from 'react-dom';

import { useDropdownVisibility } from '../hooks/useDropdownVisibility';
import CreateRoomList from './CreateRoomList';

const CREATE_ROOM_PERMISSIONS = ['create-c', 'create-p', 'create-d', 'start-discussion', 'start-discussion-other-user'];

const CreateRoom: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = (props) => {
	const reference = useRef(null);
	const target = useRef(null);
	const { isVisible, toggle } = useDropdownVisibility({ reference, target });

	const showCreate = useAtLeastOnePermission(CREATE_ROOM_PERMISSIONS);

	return (
		<>
			{showCreate && (
				<Box
					width={'112px'}
					height={'42px'}
					title='Add New'
					onClick={(): void => toggle()}
					{...props}
					ref={reference}
					// icon='edit-rounded'
					padding={'8px 16px'}
					margin={'5px'}
					borderRadius={'0.375rem'}
					lineHeight={'1.5'}
					display='flex'
					alignItems='center'
					justifyContent='space-between'
					color='#ffffff'
					bg='#2C7BE5'
				>
					<Icon name='edit-rounded' size='x16' />
					Add new
				</Box>
			)}
			{isVisible &&
				createPortal(
					<Dropdown reference={reference} ref={target}>
						<CreateRoomList closeList={(): void => toggle(false)} />
					</Dropdown>,
					document.body,
				)}
		</>
	);
};

export default CreateRoom;
