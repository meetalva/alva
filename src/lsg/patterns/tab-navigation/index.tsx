import { colors } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface TabNavigationProps {
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	tabText?: string;
}

export interface TabNavigationItemProps {
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	tabText?: string;
}

const StyledTabNavigation = styled.div`
	display: flex;
	flex-wrap: wrap;
`;

const StyledTabNavigationItem = styled.div`
	margin-right: ${getSpace(Size.L)}px;
	${(props: TabNavigationItemProps) => props.active
		? `color: ${colors.blue.toString()};`
		: `color: ${colors.grey90.toString()};`
	}
	font-family: ${fonts().NORMAL_FONT};
	cursor: pointer;

	&:last-child {
		margin-right: 0;
	}
`;

export const TabNavigationItem: React.StatelessComponent<TabNavigationItemProps> = (props): JSX.Element => (
	<StyledTabNavigationItem
		active={props.active}
		onClick={props.onClick}
	>
		{props.tabText}
	</StyledTabNavigationItem>
);

export const TabNavigation: React.StatelessComponent<TabNavigationProps> = (props): JSX.Element => (
	<StyledTabNavigation>
		{props.children}
	</StyledTabNavigation>
);

export default TabNavigation;
