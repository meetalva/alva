import StringItem from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

const StringItemDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<StyledDemo>
			<StringItem
				handleChange={e => {
					console.log(e.currentTarget.value);
				}}
				label="Text"
			/>
		</StyledDemo>
		<StyledDemo>
			<StringItem
				handleChange={e => {
					console.log(e.currentTarget.value);
				}}
				label="Text"
				value="this is a very long example text to test text overflow and stuff"
			/>
		</StyledDemo>
	</div>
);

export default StringItemDemo;
