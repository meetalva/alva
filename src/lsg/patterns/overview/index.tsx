import * as React from 'react';
import styled from 'styled-components';

import { colors } from '../colors';

const StyledOverview = styled.section`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	min-height: calc(100vh - 54px); // 54px is the height of the app chrome
	background-color: ${colors.grey90.toString()};
`;

const Overview: React.StatelessComponent<{}> = (props): JSX.Element => (
	<StyledOverview>{props.children}</StyledOverview>
);

export default Overview;
