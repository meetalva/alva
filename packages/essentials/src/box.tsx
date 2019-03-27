import * as React from 'react';

export interface BoxProps {
	/**
	 * @name Flex
	 * @default true
	 * */
	flex?: boolean;

	/**
	 * @name Direction
	 * @default Vertical
	 * @group Alignment
	 * */
	flexDirection?: FlexDirection;

	/**
	 * @name Horizontal
	 * @default Center
	 * @group Alignment
	 * */
	justifyContent?: JustifyContent;

	/**
	 * @name Vertical
	 * @default Center
	 * @group Alignment
	 * */
	alignItems?: AlignItems;

	/** @name Wrap */
	flexWrap?: boolean;

	/** @name Basis */
	flexBasis?: number;

	/** @name Grow */
	flexGrow?: number;

	/** @name Shrink @default 1 */
	flexShrink?: number;

	/** @name Width @default auto */
	width?: number | string;

	/** @name Height @default auto */
	height?: number | string;

	/** @name Background Color @control color */
	backgroundColor?: string;

	children?: React.ReactNode;
}

export enum FlexDirection {
	/** @name Horizontal */
	row = 'row',
	/** @name Vertical */
	column = 'column'
}

export enum JustifyContent {
	/** @name Left */
	'flex-start' = 'flex-start',
	/** @name Center */
	center = 'center',
	/** @name End */
	'flex-end' = 'flex-end',
	/** @name Stretch */
	stretch = 'stretch',
	/** @name Space Between */
	'space-between' = 'space-between',
	/** @name Space Around */
	'space-around' = 'space-around',
	/** @name Space Evenly */
	'space-evenly' = 'space-evenly'
}

export enum AlignItems {
	/** @name Top */
	'flex-start' = 'flex-start',
	/** @name Center */
	center = 'center',
	/** @name Bottom */
	'flex-end' = 'flex-end',
	/** @name Stretch */
	stretch = 'stretch',
	/** @name Space Between */
	'space-between' = 'space-between',
	/** @name Space Around */
	'space-around' = 'space-around',
	/** @name Space Evenly */
	'space-evenly' = 'space-evenly',
	/** @name Baseline */
	baseline = 'baseline'
}

/**
 * @name Box
 * @description for Flexbox Layouts
 * @icon Box
 * @patternType synthetic:box
 */
export const Box: React.SFC<BoxProps> = props => {
	return (
		<div
			style={{
				flexBasis: props.flexBasis,
				flexDirection: props.flexDirection,
				flexWrap: props.flexWrap ? 'wrap' : 'nowrap',
				flexGrow: props.flexGrow,
				flexShrink: props.flexShrink,
				alignItems: props.alignItems,
				display: props.flex ? 'flex' : 'block',
				justifyContent: props.justifyContent,
				width: props.width,
				height: props.height,
				backgroundColor: props.backgroundColor
			}}
		>
			{props.children}
		</div>
	);
};
