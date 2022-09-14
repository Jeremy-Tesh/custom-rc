import { useMemo } from 'react';

export function useExampleData({ additionalFields, url }) {
	return useMemo(() => {
		const exampleData = {
			...additionalFields,
			text: 'Example message',
			attachments: [
				{
					title: 'Collaboration',
					title_link: 'https://rocket.chat',
					text: 'Collaboration, the best open source chat',
					image_url: '/images/integration-attachment-example.png',
					color: '#764FA5',
				},
			],
		};

		return [exampleData, `curl -X POST -H 'Content-Type: application/json' --data '${JSON.stringify(exampleData)}' ${url}`];
	}, [additionalFields, url]);
}
