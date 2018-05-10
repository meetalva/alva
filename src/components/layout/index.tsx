import { colors } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export enum LayoutDirection {
	Row = 'row',
	Column = 'column'
}

export enum LayoutSide {
	Right = 'Right',
	Left = 'Left'
}

export enum LayoutBorder {
	None = 'None',
	Side = 'Side'
}

export enum LayoutWrap {
	Wrap = 'Wrap',
	NoWrap = 'NoWrap'
}

export interface LayoutProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: LayoutSide;
}

export interface MainAreaProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface SideBarProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: LayoutSide;
}

export interface LayoutProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	wrap?: LayoutWrap;
}

const StyledLayout = styled.div`
	display: flex;
	width: 100%;
	flex-direction: ${(props: LayoutProps) =>
		props.direction === LayoutDirection.Column ? 'column' : 'row'};
	flex-wrap: ${(props: LayoutProps) => (props.wrap === LayoutWrap.Wrap ? 'wrap' : 'nowrap')};
	border-width: 0;
	border-style: solid;
	border-color: ${colors.black.toString('rgb', { alpha: 0.1 })};
	border-right-width: ${props =>
		props.side === LayoutSide.Left && props.border === LayoutBorder.Side ? 1 : 0}px;
	border-left-width: ${props =>
		props.side === LayoutSide.Right && props.border === LayoutBorder.Side ? 1 : 0}px;

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-right-width: ${props =>
			props.side === LayoutSide.Left && props.border === LayoutBorder.Side ? 0.5 : 0}px;
		border-left-width: ${props =>
			props.side === LayoutSide.Right && props.border === LayoutBorder.Side ? 0.5 : 0}px;
	}
`;

const StyledMainArea = styled(StyledLayout)`
	box-sizing: border-box;
	height: 100vh;
	padding-top: 40px;
	-webkit-font-smoothing: antialiased;
`;

const StyledSideBar = styled(StyledLayout)`
	flex-basis: 240px;
	overflow-y: hidden;
`;

export const MainArea: React.StatelessComponent<MainAreaProps> = props => (
	<StyledMainArea className={props.className} direction={props.direction} border={props.border}>
		{props.children}
	</StyledMainArea>
);

export const SideBar: React.StatelessComponent<SideBarProps> = props => (
	<StyledSideBar
		className={props.className}
		direction={props.direction}
		border={props.border}
		onClick={props.onClick}
		side={props.side}
	>
		{props.children}
	</StyledSideBar>
);

export const Layout: React.StatelessComponent<LayoutProps> = props => (
	<StyledLayout
		className={props.className}
		direction={props.direction}
		border={props.border}
		onClick={props.onClick}
		wrap={props.wrap}
	>
		{props.children}
	</StyledLayout>
);

export default Layout;
