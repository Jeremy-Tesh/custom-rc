import React from 'react';

import AppProvider from '../hooks/AppContext';
import RoomList from './RoomList';

const Index = () => (
	<AppProvider>
		<RoomList />
	</AppProvider>
);

export default Index;
