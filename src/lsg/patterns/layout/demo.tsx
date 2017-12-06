import { colors } from '../colors';
import Layout from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledTestDiv = styled.div`
	flex-grow: 1;
	padding: 20px 10px;
	background: ${colors.grey90.toString()};

	&:nth-child(odd) {
		background: ${colors.grey70.toString()};
	}
`;

const LayoutDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<Layout directionVertical={true}>
			<StyledTestDiv>Vertical</StyledTestDiv>
			<StyledTestDiv>Vertical</StyledTestDiv>
			<StyledTestDiv>Vertical</StyledTestDiv>
		</Layout>
		<Layout>
			<StyledTestDiv>Horizontal</StyledTestDiv>
			<StyledTestDiv>Horizontal</StyledTestDiv>
			<StyledTestDiv>Horizontal</StyledTestDiv>
		</Layout>
	</div>
);

export default LayoutDemo;
