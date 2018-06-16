import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface TabSwitchProps {
	active?: TabSwitchState;
	onClick?: React.MouseEventHandler<HTMLElement>;
	children?: React.ReactNode;
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

	&:active {
		color: ${Color.Grey20};
	}
`;

export const TabSwitch: React.SFC<TabSwitchProps> = props => (
	<StyledTabSwitch active={props.active} onClick={props.onClick}>
		{props.children}
	</StyledTabSwitch>
);
