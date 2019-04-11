import * as React from 'react';

export interface ImageProps {
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

/**
 * @name Image
 * @icon Image
 * @description for photos & design assets
 * @patternType synthetic:image
 */
export const Image: React.SFC<ImageProps> = props => {
	return (
		<img
			src={props.src}
			onClick={props.onClick}
			style={{
				width: props.width,
				height: props.height,
				minWidth: props.minWidth,
				maxWidth: props.maxWidth,
				minHeight: props.minHeight,
				maxHeight: props.maxHeight
			}}
		/>
	);
};
