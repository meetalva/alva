import { Color } from '../colors';
import { SpaceSize } from '../space';
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

export enum LayoutHeight {
	Full = '100%',
	Auto = 'auto'
}

export interface LayoutProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	inset?: SpaceSize;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: LayoutSide;
	children?: React.ReactNode;
}

export interface MainAreaProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	children?: React.ReactNode;
}

export interface SideBarProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: LayoutSide;
	children?: React.ReactNode;
}

export interface LayoutProps {
	border?: LayoutBorder;
	className?: string;
	direction?: LayoutDirection;
	inset?: SpaceSize;
	onClick?: React.MouseEventHandler<HTMLElement>;
	wrap?: LayoutWrap;
	children?: React.ReactNode;
	height?: LayoutHeight;
}

export const Layout = styled.div`
	display: flex;
	width: 100%;
	height: ${(props: LayoutProps) => props.height};
	box-sizing: border-box;
	flex-direction: ${(props: LayoutProps) =>
		props.direction === LayoutDirection.Column ? 'column' : 'row'};
	flex-wrap: ${(props: LayoutProps) => (props.wrap === LayoutWrap.Wrap ? 'wrap' : 'nowrap')};
	border-width: 0;
	border-style: solid;
	border-color: ${Color.BlackAlpha15};
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
	${(props: LayoutProps) => {
		if (!props.inset) {
			return '';
		}
		return `padding: ${props.inset}px`;
	}};
`;

export const MainArea = styled(Layout).attrs({ height: LayoutHeight.Full })`
	box-sizing: border-box;
	-webkit-font-smoothing: antialiased;
`;

export const SideBar = styled(Layout).attrs({ height: LayoutHeight.Full })`
	flex-basis: 240px;
	overflow-y: auto;
`;

export const RelativeArea = styled.div`
	position: relative;
`;
