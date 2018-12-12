import * as React from 'react';

export interface LinkProps {
	/** @name Interaction @description You can set an interaction that happens on Click. */
	onClick?: React.MouseEventHandler<HTMLElement>;

	/** @ignore */
	href?: string;

	/** @ignore */
	target?: string;

	/** @ignore */
	rel?: string;

	children?: React.ReactNode;
}

export const Link: React.SFC<LinkProps> = props => {
	return (
		<a href={props.href} onClick={props.onClick} target={props.target} rel={props.rel}>
			{props.children}
		</a>
	);
};
