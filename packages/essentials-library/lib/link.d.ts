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
export declare const Link: React.SFC<LinkProps>;
