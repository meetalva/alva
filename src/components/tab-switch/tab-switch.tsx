import { Color } from '../colors';
import { Copy } from '../copy';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface TabSwitchProps {
	active?: boolean;
	icon?: IconName;
	label?: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	title: string;
}

const StyledTabSwitch = styled.div`
	display: flex;
	box-sizing: border-box;
	padding: 0 ${getSpace(SpaceSize.XS)}px;
	color: ${(props: TabSwitchProps) => (props.active ? Color.Blue : Color.Grey50)};
	height: 100%;
	align-items: center;

	&:active {
		color: ${Color.Grey20};
	}
`;

export const TabSwitch: React.SFC<TabSwitchProps> = props => (
	<StyledTabSwitch
		active={props.active}
		icon={props.icon}
		label={props.label}
		onClick={props.onClick}
		title={props.title}
	>
		{props.icon && <Icon name={props.icon} size={IconSize.S} />}
		{props.label && <Copy>{props.label}</Copy>}
	</StyledTabSwitch>
);
