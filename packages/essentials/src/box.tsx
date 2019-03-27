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
	 * @control ButtonGroup
	 * */
	flexDirection?: FlexDirection;

	/**
	 * @name Justify
	 * @default Center
	 * @group Alignment
	 * @control ButtonGroup
	 * */
	justifyContent?: JustifyContent;

	/**
	 * @name Align
	 * @default Center
	 * @group Alignment
	 * @control ButtonGroup
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
	/** @name Start @icon FlexJustifyStart */
	'flex-start' = 'flex-start',

	/** @name Center @icon FlexJustifyCenter */
	'center' = 'center',

	/** @name End @icon FlexJustifyEnd*/
	'flex-end' = 'flex-end',

	/** @name Space Between @icon FlexJustifySpaceBetween */
	'space-between' = 'space-between',

	/** @name Space Around @icon FlexJustifySpaceAround */
	'space-around' = 'space-around'
}

export enum AlignItems {
	/** @name Start @icon FlexAlignStart */
	'flex-start' = 'flex-start',

	/** @name Center @icon FlexAlignCenter */
	'center' = 'center',

	/** @name Bottom @icon FlexAlignEnd */
	'flex-end' = 'flex-end',

	/** @name Stretch @icon FlexAlignStretch */
	'stretch' = 'stretch',

	/** @name Baseline @icon FlexAlignBaseline */
	'baseline' = 'baseline'
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
