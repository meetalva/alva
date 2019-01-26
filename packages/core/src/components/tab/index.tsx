import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';
import { Copy, CopySize } from '../copy';

export interface TabProps {
	active?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledTab = styled.div`
	border-bottom: 3px solid ${(props: TabProps) => (props.active ? Color.Blue20 : 'transparent')};
	color: ${(props: TabProps) => (props.active ? Color.Blue : Color.Grey36)};
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	box-sizing: border-box;
	padding-top: ${getSpace(SpaceSize.XXS)}px;
	margin: 0 ${getSpace(SpaceSize.XS)}px 0;

	&:active {
		color: ${(props: TabProps) => (props.active ? Color.Blue : Color.Grey20)};
	}
`;

export const Tab: React.StatelessComponent<TabProps> = props => {
	return <StyledTab {...props}>{props.children}</StyledTab>;
};
