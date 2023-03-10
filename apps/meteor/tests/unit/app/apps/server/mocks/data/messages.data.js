export const appMessageMock = {
	id: 'appMessageMock',
	text: 'mona',
	createdAt: new Date('2019-03-30T01:22:08.389Z'),
	updatedAt: new Date('2019-03-30T01:22:08.412Z'),
	groupable: false,
	room: {
		id: 'GENERAL',
		displayName: 'general',
		slugifiedName: 'general',
		type: 'c',
		creator: {
			username: 'mona',
			emails: [
				{
					address: 'rocketcat@rocket.chat',
					verified: true,
				},
			],
			type: 'bot',
			isEnabled: true,
			name: 'mona',
			roles: ['bot'],
			status: 'online',
			statusConnection: 'online',
			utcOffset: 0,
			createdAt: new Date('2019-04-13T01:33:14.191Z'),
			updatedAt: new Date('2019-04-13T01:33:14.191Z'),
		},
	},
	sender: {
		id: 'mona',
		username: 'mona',
		emails: [
			{
				address: 'rocketcat@rocket.chat',
				verified: true,
			},
		],
		type: 'bot',
		isEnabled: true,
		name: 'mona',
		roles: ['bot'],
		status: 'online',
		statusConnection: 'online',
		utcOffset: 0,
		createdAt: new Date('2019-04-13T01:33:14.191Z'),
		updatedAt: new Date('2019-04-13T01:33:14.191Z'),
	},
	_unmappedProperties_: {
		t: 'uj',
	},
};

export const appMessageInvalidRoomMock = {
	id: 'appMessageInvalidRoomMock',
	text: 'mona',
	createdAt: new Date('2019-03-30T01:22:08.389Z'),
	updatedAt: new Date('2019-03-30T01:22:08.412Z'),
	groupable: false,
	room: {
		id: 'INVALID IDENTIFICATION',
		displayName: 'Mocked Room',
		slugifiedName: 'mocked-room',
		type: 'c',
		creator: {
			username: 'mona',
			emails: [
				{
					address: 'rocketcat@rocket.chat',
					verified: true,
				},
			],
			type: 'bot',
			isEnabled: true,
			name: 'mona',
			roles: ['bot'],
			status: 'online',
			statusConnection: 'online',
			utcOffset: 0,
			createdAt: new Date('2019-04-13T01:33:14.191Z'),
			updatedAt: new Date('2019-04-13T01:33:14.191Z'),
		},
	},
	sender: {
		id: 'mona',
		username: 'mona',
		emails: [
			{
				address: 'rocketcat@rocket.chat',
				verified: true,
			},
		],
		type: 'bot',
		isEnabled: true,
		name: 'mona',
		roles: ['bot'],
		status: 'online',
		statusConnection: 'online',
		utcOffset: 0,
		createdAt: new Date('2019-04-13T01:33:14.191Z'),
		updatedAt: new Date('2019-04-13T01:33:14.191Z'),
	},
	_unmappedProperties_: {
		t: 'uj',
	},
};
