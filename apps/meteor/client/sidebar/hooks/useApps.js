import { useEffect, useState } from 'react';

export const useApps = () => {
	const data = [
		{
			articles: [
				{
					name: 'News',
					url: 'www.google.com',
					roles: ['all'],
				},

				{
					name: 'User Engagement',
					url: 'www.google.com',
					roles: ['all'],
				},
				{
					name: 'Attendance',
					url: 'www.google.com',
					roles: ['admin'],
				},
			],
		},
	];
	// const items = data.flatMap((item) => item['articles']);

	const [apps, setApps] = useState([]);
	useEffect(() => {
		setApps(() => data.flatMap((item) => item.articles));
	}, []);

	return apps;
};
