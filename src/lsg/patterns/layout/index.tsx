import { getSpace, Size } from '../space/index';
import * as React from 'react';
import styled from 'styled-components';

export interface LayoutProps {
	className?: string;
	directionVertical?: boolean;
	hasMargins?: boolean;
}

const StyledLayout = styled.div`
	display: flex;
	justify-content: space-between;
	${(props: LayoutProps) => (props.directionVertical ? 'flex-direction: column;' : '')};
	${(props: LayoutProps) => (props.hasMargins ? `margin: 0 ${getSpace(Size.L)}px` : '')};
`;

const Layout: React.StatelessComponent<LayoutProps> = props => (
	<StyledLayout
		className={props.className}
		directionVertical={props.directionVertical}
		hasMargins={props.hasMargins}
	>
		{props.children}
	</StyledLayout>
);

export default Layout;
