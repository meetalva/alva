import { colors } from '../../colors';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

const StyledPatternsPane = styled.div`
	box-sizing: border-box;
	flex-grow: 2;
	flex-shrink: 0;
	flex-basis: 40%;
	padding: ${getSpace(Size.M)}px 0;
	border-top: 1px solid ${colors.grey90.toString()};
	overflow: scroll;
	margin-left: -${getSpace(Size.L)}px;
	margin-right: -${getSpace(Size.L)}px;
`;

const PatternsPane: React.StatelessComponent = props => <StyledPatternsPane>{props.children}</StyledPatternsPane>;

export default PatternsPane;
