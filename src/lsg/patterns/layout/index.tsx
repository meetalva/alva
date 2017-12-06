import * as React from 'react';
import styled from 'styled-components';

export interface LayoutProps {
	className?: string;
	directionVertical?: boolean;
}

const StyledLayout = styled.div`
	display: flex;
	justify-content: space-between;
	${(props: LayoutProps) => props.directionVertical
		? 'flex-direction: column;'
		: ''
	}
`;

const Layout: React.StatelessComponent<LayoutProps> = props => (
	<StyledLayout className={props.className} directionVertical={props.directionVertical}>
		{props.children}
	</StyledLayout>
);

export default Layout;
