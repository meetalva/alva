import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import styled, { StyledComponentClass } from 'styled-components';

export interface LinkProps {
	className?: string;
	color?: Color;
	disabled?: boolean;
	onClick?: React.MouseEventHandler<HTMLElement>;
	uppercase?: boolean;
}

const StyledLink: StyledComponentClass<LinkProps, {}> = styled.a`
	font-family: ${fonts().NORMAL_FONT};
	${(props: LinkProps) => (props.color ? `color: ${props.color.toString()}` : 'color: inherit')};
	${(props: LinkProps) => (props.onClick ? 'cursor: pointer;' : 'cursor: auto;')} ${(
		props: LinkProps
	) => (props.uppercase ? 'text-transform: uppercase;' : '')};
`;

export const Link: React.StatelessComponent<LinkProps> = props => (
	<StyledLink
		className={props.className}
		color={props.color}
		disabled={props.disabled}
		onClick={props.onClick}
		uppercase={props.uppercase}
	>
		{props.children}
	</StyledLink>
);

export default Link;
