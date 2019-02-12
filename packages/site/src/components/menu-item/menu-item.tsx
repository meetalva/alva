import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { Copy } from '../copy';

export interface MenuItemProps {
	/** @name Copy */ linkName?: string;
	/** @name Link */ onClick?: React.MouseEventHandler<HTMLDivElement>;
	href?: string;
	target?: string;
	rel?: string;
	title?: string;
}

const StyledMenuItem = styled(Copy)`
	cursor: pointer;
`;

/**
 * @icon Menu
 */
export const MenuItem: React.StatelessComponent<MenuItemProps> = props => {
	return (
		<a
			href={props.href}
			target={props.target}
			rel={props.rel}
			title={props.title}
			style={{ textDecoration: 'none', marginLeft: 32, color: Color.White }}
		>
			<StyledMenuItem>{props.linkName}</StyledMenuItem>
		</a>
	);
};
