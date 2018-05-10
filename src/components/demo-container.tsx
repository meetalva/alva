import globalStyles from './global-styles';
import { Headline } from './headline';
import * as React from 'react';
import styled from 'styled-components';

globalStyles();

export interface DemoContainerProps {
	className?: string;
	title?: string;
}

const StyledDemoContainer = styled.div`
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
`;

const DemoContainer: React.StatelessComponent<DemoContainerProps> = props => (
	<StyledDemoContainer className={props.className}>
		{props.title && <Headline>{props.title}</Headline>}
		{props.children}
	</StyledDemoContainer>
);

export default DemoContainer;
