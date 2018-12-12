import * as React from 'react';
export interface DesignProps {
	/** @name Image @asset */
	src?: string;
	/** @name Width */
	width?: string;
	/** @name Height */
	height?: string;
	/** @name Min Width */
	minWidth?: string;
	/** @name Min Height */
	minHeight?: string;
	/** @name Max Width */
	maxWidth?: string;
	/** @name Max Height */
	maxHeight?: string;
	/** @name Interaction @description You can set an interaction that happens on Click. */
	onClick?: React.MouseEventHandler<HTMLElement>;
}
export declare const Design: React.SFC<DesignProps>;
