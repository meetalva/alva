import { colors } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface ChromeProps {
	leftVisible?: boolean;
	onLeftClick?: React.MouseEventHandler<HTMLElement>;
	onRightClick?: React.MouseEventHandler<HTMLElement>;
	rightVisible?: boolean;
	title?: string;
}

const StyledChrome = styled.div`
	box-sizing: border-box;
	position: absolute;
	top: 0;
	display: grid;
	grid-template-columns: 33.333% 33.333% 33.333%;
	width: 100%;
	height: 40px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXL) * 3}px;
	border-bottom: 1px solid ${colors.grey90.toString()};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-bottom-width: 0.5px;
	}
	background: ${colors.white.toString()};
	font-family: ${fonts().NORMAL_FONT};
	-webkit-app-region: drag;
	-webkit-user-select: none;
	user-select: none;
	-webkit-font-smoothing: antialiased;
`;

const Chrome: React.StatelessComponent<ChromeProps> = props => (
	<StyledChrome>{props.children}</StyledChrome>
);

export default Chrome;
