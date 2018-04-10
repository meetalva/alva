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
	height: 54px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXL) * 3}px;
	font-family: ${fonts().NORMAL_FONT};
	-webkit-app-region: drag;
	-webkit-user-select: none;
	user-select: none;
`;

const Chrome: React.StatelessComponent<ChromeProps> = props => (
	<StyledChrome>{props.children}</StyledChrome>
);

export default Chrome;
