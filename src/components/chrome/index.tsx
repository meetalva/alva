import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface ChromeProps {
	children?: React.ReactNode;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledChrome = styled.div`
	box-sizing: border-box;
	display: grid;
	grid-template-columns: 33.333% 33.333% 33.333%;
	align-items: center;
	width: 100%;
	height: 40px;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXL) * 3}px;
	border-bottom: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-bottom-width: 0.5px;
	}
	background: ${Color.White};
	font-family: ${fonts().NORMAL_FONT};
	-webkit-app-region: drag;
	-webkit-user-select: none;
	user-select: none;
	-webkit-font-smoothing: antialiased;
`;

export const Chrome: React.StatelessComponent<ChromeProps> = props => (
	<StyledChrome onDoubleClick={props.onDoubleClick}>{props.children}</StyledChrome>
);
