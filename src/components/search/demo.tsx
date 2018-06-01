import DemoContainer from '../demo-container';
import { Search } from '.';
import * as React from 'react';

const SearchDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Search">
		<Search placeholder="Placeholder.." />
	</DemoContainer>
);

export default SearchDemo;
