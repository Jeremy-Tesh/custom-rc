import { Box } from '@rocket.chat/fuselage';
import React, { VFC, HTMLAttributes } from 'react';

import SearchList from '../../search/SearchList';

const Search: VFC<Omit<HTMLAttributes<HTMLElement>, 'is'>> = () => {
	// const [searchOpen, setSearchOpen] = useState(false);

	// const ref = useRef<HTMLElement>(null);
	// const handleCloseSearch = useMutableCallback(() => {
	// 	setSearchOpen(false);
	// });

	// useOutsideClick([ref], handleCloseSearch);

	// const openSearch = useMutableCallback(() => {
	// 	setSearchOpen(true);
	// });

	// useEffect(() => {
	// 	const unsubscribe = tinykeys(window, {
	// 		'$mod+K': (event) => {
	// 			event.preventDefault();
	// 			openSearch();
	// 		},
	// 		'$mod+P': (event) => {
	// 			event.preventDefault();
	// 			openSearch();
	// 		},
	// 	});

	// 	return (): void => {
	// 		unsubscribe();

	// 	};
	// }, [openSearch]);

	return (
		<>
			<Box w='full'>
				<SearchList />
			</Box>
		</>
	);
};

export default Search;
