import { css } from '@rocket.chat/css-in-js';
import { Box, SidebarSection } from '@rocket.chat/fuselage';
import FeatherIcon from 'feather-icons-react';
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
			<Box onClick={() => setOpen(!open)} className={itemStyle}>
				<SidebarSection.Title>{title}</SidebarSection.Title>
				<FeatherIcon icon={open ? 'chevron-up' : 'chevron-down'} size='1em' />
			</Box>

			{open && (
				<>
					{list.map((item, index) => (
						<Row key={index} data={itemData} item={item} />
					))}
				</>
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
