import { Box, SidebarSection } from '@rocket.chat/fuselage';
import FeatherIcon from 'feather-icons-react';
import React, { useState } from 'react';

import Row from './Row';

function RoomItems({ list, title, itemData }) {
	const [open, setOpen] = useState(false);

	return (
		<div className='mb-3'>
			<Box pb='10px' onClick={() => setOpen(!open)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
				<SidebarSection.Title>{title}</SidebarSection.Title>
				<FeatherIcon icon={open ? 'chevron-up' : 'chevron-down'} size='1em' />
			</Box>

			<div style={open ? { height: 'auto', overflow: 'hidden' } : { height: '0px', overflow: 'hidden' }}>
				{list.map((item, index) => (
					<Row key={index} data={itemData} item={item} />
				))}
				{/* <Virtuoso
					totalCount={10}
					data={list}
					components={{ Scroller: ScrollerWithCustomProps }}
					computeItemKey={computeItemKey}
					itemContent={(_, data) => {
						return <Row data={itemData} item={data} />;
					}}
				/> */}
			</div>
		</div>
	);
}

export default RoomItems;
