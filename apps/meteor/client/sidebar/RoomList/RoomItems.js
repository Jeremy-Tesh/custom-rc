import { Box, SidebarSection } from '@rocket.chat/fuselage';
import FeatherIcon from 'feather-icons-react';
import { css } from '@rocket.chat/css-in-js';
import React, { useState } from 'react';

import Row from './Row';

function RoomItems({ list, title, itemData }) {
	const [open, setOpen] = useState(false);

	const itemStyle = css`
		cursor: pointer;
		display: flex;
		padding: 15px 0px;
		width: 100%;
		justify-content: space-between;
	`;

	return (
		<Box>
			<Box pb='10px' onClick={() => setOpen(!open)} className={itemStyle}>
				<SidebarSection.Title>{title}</SidebarSection.Title>
				<FeatherIcon icon={open ? 'chevron-up' : 'chevron-down'} size='1em' />
			</Box>

			{open && (
				<Box height='auto' p='8px'>
					{list.map((item, index) => (
						<Row key={index} data={itemData} item={item} />
					))}
				</Box>
			)}

			{/* <Virtuoso
					totalCount={10}
					data={list}
					components={{ Scroller: ScrollerWithCustomProps }}
					computeItemKey={computeItemKey}
					itemContent={(_, data) => {
						return <Row data={itemData} item={data} />;
					}}
				/> */}
		</Box>
	);
}

export default RoomItems;
