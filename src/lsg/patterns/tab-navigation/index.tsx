import { colors } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
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
	width: 100%;
	border: 1px solid ${colors.grey60.toString()};
	border-radius: 3px;
`;

const StyledTabNavigationItem = styled.div`
	flex-grow: 1;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.M)}px;
	${(props: TabNavigationItemProps) =>
		props.active
			? `background: ${colors.grey60.toString()};
			color: ${colors.white.toString()};`
			: `background: ${colors.white.toString()};
			color: ${colors.grey60.toString()};`}
	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	text-align: center;
	cursor: pointer;
`;

export const TabNavigationItem: React.StatelessComponent<TabNavigationItemProps> = (
	props
): JSX.Element => (
	<StyledTabNavigationItem active={props.active} onClick={props.onClick}>
		{props.tabText}
	</StyledTabNavigationItem>
);

export const TabNavigation: React.StatelessComponent<TabNavigationProps> = (props): JSX.Element => (
	<StyledTabNavigation>{props.children}</StyledTabNavigation>
);

export default TabNavigation;
