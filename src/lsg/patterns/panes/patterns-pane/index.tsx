import { colors } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

const StyledPatternsPane = styled.div`
	box-sizing: border-box;
	flex-grow: 2;
	flex-shrink: 0;
	flex-basis: 40%;
	border-top: 2px solid ${colors.grey70.toString()};
	overflow: scroll;
`;

const PatternsPane: React.StatelessComponent<{}> = props => <StyledPatternsPane>{props.children}</StyledPatternsPane>;

export default PatternsPane;
