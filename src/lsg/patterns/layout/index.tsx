import { colors } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface LayoutProps {
	className?: string;
	directionVertical?: boolean;
	hasBorder?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	side?: string;
}

const StyledLayout = styled.div`
	display: flex;
	${(props: LayoutProps) => (props.directionVertical ? 'flex-direction: column;' : '')};
	${(props: LayoutProps) =>
		props.hasBorder && props.side == 'left'
			? `
		border-right: 1px solid ${colors.black.toString('rgb', { alpha: 0.1 })};
		@media screen and (-webkit-min-device-pixel-ratio: 2) {
			border-right-width: 0.5px;
		}
	`
			: ''};
	${(props: LayoutProps) =>
		props.hasBorder && props.side == 'right'
			? `
		border-left: 1px solid ${colors.black.toString('rgb', { alpha: 0.1 })};
		@media screen and (-webkit-min-device-pixel-ratio: 2) {
			border-left-width: 0.5px;
		}
	`
			: ''};
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

export const MainArea: React.StatelessComponent<LayoutProps> = props => (
	<StyledMainArea
		className={props.className}
		directionVertical={props.directionVertical}
		hasBorder={props.hasBorder}
	>
		{props.children}
	</StyledMainArea>
);

export const SideBar: React.StatelessComponent<LayoutProps> = props => (
	<StyledSideBar
		className={props.className}
		directionVertical={props.directionVertical}
		hasBorder={props.hasBorder}
		onClick={props.onClick}
		side={props.side}
	>
		{props.children}
	</StyledSideBar>
);

const Layout: React.StatelessComponent<LayoutProps> = props => (
	<StyledLayout
		className={props.className}
		directionVertical={props.directionVertical}
		hasBorder={props.hasBorder}
		onClick={props.onClick}
	>
		{props.children}
	</StyledLayout>
);

export default Layout;
