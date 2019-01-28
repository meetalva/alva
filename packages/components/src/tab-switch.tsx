import { Color } from './colors';
import { Copy } from './copy';
import * as React from 'react';
import { getSpace, SpaceSize } from './space';
import styled from 'styled-components';

export interface TabSwitchProps {
	active: TabSwitchState;
	label: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	title: string;
}

export enum TabSwitchState {
	Active,
	Default
}

const StyledTabSwitch = styled.div`
	display: flex;
	box-sizing: border-box;
	padding: 0 ${getSpace(SpaceSize.XS)}px;
	color: ${(props: TabSwitchProps) =>
		props.active === TabSwitchState.Active ? Color.Blue : Color.Grey50};
	height: 100%;
	align-items: center;
	justify-content: center;
	width: auto;

	background: ${(props: TabSwitchProps) =>
		props.active === TabSwitchState.Active ? Color.Blue80 : 'transparent'};
	border-bottom: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-bottom-width: 0.5px;
	}

	user-select: none;
	cursor: default;

	&:active {
		color: ${Color.Grey20};
	}
`;

export const TabSwitch: React.SFC<TabSwitchProps> = props => (
	<StyledTabSwitch
		active={props.active}
		label={props.label}
		onClick={props.onClick}
		title={props.title}
	>
		{props.label && <Copy>{props.label}</Copy>}
	</StyledTabSwitch>
);
