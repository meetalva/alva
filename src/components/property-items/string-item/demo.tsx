import StringItem from './index';
import * as React from 'react';
import styled from 'styled-components';

const NOOP = () => {}; // tslint:disable-line no-empty

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

const StringItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<StyledDemo>
			<StringItem onChange={NOOP} label="Text" />
		</StyledDemo>
		<StyledDemo>
			<StringItem
				onChange={NOOP}
				label="Text"
				value="this is a very long example text to test text overflow and stuff"
				description="Lorem ipsum doloret"
			/>
		</StyledDemo>
	</div>
);

export default StringItemDemo;
