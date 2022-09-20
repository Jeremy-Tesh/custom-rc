import { SidebarSection } from '@rocket.chat/fuselage';
import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import { Virtuoso } from 'react-virtuoso';

import ScrollerWithCustomProps from './ScrollerWithCustomProps';
import Row from './Row';

function Toggle({ list, title, itemData, computeItemKey }) {
	const [open, setOpen] = useState(false);

	return (
		<div className='mb-3'>
			<SidebarSection aria-level='1'>
				<div onClick={() => setOpen(!open)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', color: 'white' }}>
					<SidebarSection.Title>{title}</SidebarSection.Title>
					<FeatherIcon icon={open ? 'chevron-up' : 'chevron-down'} size='1em' />
				</div>
			</SidebarSection>
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

export default Toggle;
