import * as React from 'react';
import { getSpace, Size } from '../space';
import styled from 'styled-components';

export interface LayoutProps {
	className?: string;
	directionVertical?: boolean;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	hasPaddings?: boolean;
}

const StyledLayout = styled.div`
	display: flex;
	${(props: LayoutProps) => (props.directionVertical ? 'flex-direction: column;' : '')};
	${(props: LayoutProps) => (props.hasPaddings ? `padding: 0 ${getSpace(Size.L)}px` : '')};
`;

const StyledMainArea = styled(StyledLayout)`
	box-sizing: border-box;
	height: 100vh;
	padding-top: 54px;
`;

const StyledSideBar = styled(StyledLayout)`
	flex-basis: 240px;
	overflow-y: hidden;
`;

export const MainArea: React.StatelessComponent<LayoutProps> = props => (
	<StyledMainArea
		className={props.className}
		directionVertical={props.directionVertical}
		hasPaddings={props.hasPaddings}
	>
		{props.children}
	</StyledMainArea>
);

export const SideBar: React.StatelessComponent<LayoutProps> = props => (
	<StyledSideBar
		className={props.className}
		directionVertical={props.directionVertical}
		hasPaddings={props.hasPaddings}
	>
		{props.children}
	</StyledSideBar>
);

const Layout: React.StatelessComponent<LayoutProps> = props => (
	<StyledLayout
		className={props.className}
		directionVertical={props.directionVertical}
		hasPaddings={props.hasPaddings}
		onClick={props.handleClick}
	>
		{props.children}
	</StyledLayout>
);

export default Layout;
