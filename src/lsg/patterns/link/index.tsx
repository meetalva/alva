import { Color } from '../colors';
import * as React from 'react';
import styled, { StyledComponentClass } from 'styled-components';

export interface LinkProps {
	className?: string;
	color?: Color;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledLink: StyledComponentClass<LinkProps, {}> = styled.a`
	color: ${(props: LinkProps) => props.color
		? props.color.toString()
		: 'inherit'
	};
`;

const Link: React.StatelessComponent<LinkProps> = props => (
	<StyledLink>
		{props.children}
	</StyledLink>
);

export default Link;
