import { colors } from '../colors';
import DemoContainer from '../demo-container';
import Layout, { LayoutBorder, LayoutDirection } from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledTestDiv = styled.div`
	flex-grow: 1;
	padding: 20px 10px;
	background: ${colors.grey90.toString()};

	&:nth-child(odd) {
		background: ${colors.grey60.toString()};
	}
`;

const LayoutDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Layout">
		<Layout direction={LayoutDirection.Column}>
			<StyledTestDiv>Vertical</StyledTestDiv>
			<StyledTestDiv>Vertical</StyledTestDiv>
			<StyledTestDiv>Vertical</StyledTestDiv>
		</Layout>
		<Layout>
			<StyledTestDiv>Horizontal</StyledTestDiv>
			<StyledTestDiv>Horizontal</StyledTestDiv>
			<StyledTestDiv>Horizontal</StyledTestDiv>
		</Layout>
		<Layout direction={LayoutDirection.Column} border={LayoutBorder.Side}>
			<StyledTestDiv>Vertical with margins</StyledTestDiv>
			<StyledTestDiv>Vertical with margins</StyledTestDiv>
			<StyledTestDiv>Vertical with margins</StyledTestDiv>
		</Layout>
	</DemoContainer>
);

export default LayoutDemo;
