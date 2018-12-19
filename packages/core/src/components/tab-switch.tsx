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
	type: TabSwitchType;
}

export enum TabSwitchType {
	Toggle,
	Tab
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

	width: ${(props: TabSwitchProps) => (props.type === TabSwitchType.Tab ? '50%' : 'auto')};

	border-bottom: ${(props: TabSwitchProps) =>
		props.type === TabSwitchType.Tab ? '3px solid' : 'none'};
	border-bottom-color: ${(props: TabSwitchProps) =>
		props.active === TabSwitchState.Active ? Color.Blue20 : 'transparent'};

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
		type={props.type}
		onClick={props.onClick}
		title={props.title}
	>
		{props.label && <Copy>{props.label}</Copy>}
	</StyledTabSwitch>
);
