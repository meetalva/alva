import { getSpace, Size } from '../space/index';
import * as React from 'react';
import styled from 'styled-components';

export interface LayoutProps {
	className?: string;
	directionVertical?: boolean;
	hasPaddings?: boolean;
}

const StyledLayout = styled.div`
	display: flex;
	justify-content: space-between;
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
	overflow-y: scroll;
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
	>
		{props.children}
	</StyledLayout>
);

export default Layout;
