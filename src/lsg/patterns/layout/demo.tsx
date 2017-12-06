import { colors } from '../colors';
import { Layout } from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledTestDiv = styled.div`
	padding: 20px 10px;
	background: ${colors.greenLight.toString()};

	&:nth-child(odd) {
		background: ${colors.greenDark.toString()};
	}
`;

const LayoutDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<Layout directionVertical={true}>
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
	</Layout>
);

export default LayoutDemo;
