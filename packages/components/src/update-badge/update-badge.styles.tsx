import styled from 'styled-components';
import { ArrowUp } from 'react-feather';
import * as Colors from '../colors';
import * as Color from 'color';

export const UpdateBadge = styled.div`
	display: flex;
	align-items: center;
	color: ${Colors.Color.White};
	font-size: 12px;
	border-radius: 2.5px;
	background: ${Colors.Color.Blue};
	padding: 3.5px 6px 3.5px 2.5px;
	&:hover {
		background: ${new Color(Colors.Color.Blue).darken(0.25).toString()};
	}
`;

export const UpdateIcon = styled(ArrowUp)`
	height: 13.5px;
	width: 13.5px;
	margin-top: -1px;
	margin-right: 1.5px;
`;
