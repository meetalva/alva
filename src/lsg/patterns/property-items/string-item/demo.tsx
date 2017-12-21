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
			<StringItem handleChange={NOOP} label="Text" />
		</StyledDemo>
		<StyledDemo>
			<StringItem
				handleChange={NOOP}
				label="Text"
				value="this is a very long example text to test text overflow and stuff"
			/>
		</StyledDemo>
	</div>
);

export default StringItemDemo;
