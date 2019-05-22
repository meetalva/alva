import * as React from 'react';

export interface BoxProps {
	/****** Group: Layout *******/

	/**
	 * @name Direction
	 * @default Row
	 * @group Layout
	 * @control ButtonGroup
	 * */
	flexDirection?: FlexDirection;

	/**
	 * @name Justify
	 * @default JustifyStart
	 * @group Layout
	 * @control ButtonGroup
	 * */
	justifyContent?: JustifyContent;

	/**
	 * @name Align
	 * @default AlignStretch
	 * @group Layout
	 * @control ButtonGroup
	 * */
	alignItems?: AlignItems;

	/**
	 * @name Children
	 * @default Don't wrap
	 * @group Layout
	 * @control ButtonGroup
	 * */
	flexWrap?: FlexWrap;

	/****** Group: Size *******/

	/**
	 * @name Width
	 * @example auto
	 * @unit px|%|em|vw|vh
	 * @group Size & Spacing
	 * */
	width?: string;

	/**
	 * @name Height
	 * @unit px|%|em|vw|vh
	 * @group Size & Spacing
	 * @default 50px
	 * */
	height?: string;

	/**
	 * @name Padding
	 * @default 0
	 * @unit px|%|em|vw|vh
	 * @group Size & Spacing
	 * */
	padding?: string;

	/**
	 * @name Margin
	 * @default 0
	 * @unit px|%|em|vw|vh
	 * @group Size & Spacing
	 * */
	margin?: string;

	/****** Group: Flex Children *******/

	/**
	 * @name Sizing
	 * @default Shrink if needed
	 * @group Flex Child
	 * @description Affects this element only, if inside a Flexible Layout.
	 * */
	flex?: Flex;

	/****** Group: Styling *******/

	/**
	 * @name Background Color
	 * @group Styling
	 * @control color
	 * @default transparent
	 * */
	backgroundColor?: string;

	/****** Group: Border *******/

	/**
	 * @name Radius
	 * @default 0
	 * @unit px|%|em
	 * @group Border
	 * @control slider
	 * */
	borderRadius?: string;

	/**
	 * @name Width
	 * @default none
	 * @unit px|em
	 * @group Border
	 * */
	borderWidth?: string;

	/**
	 * @name Color
	 * @default #000000
	 * @group Border
	 * @control color
	 * */
	borderColor?: string;

	children?: React.ReactNode;
}

export enum Flex {
	/** @name Shrink if needed */
	ShrinkIfNeeded,
	/** @name Grow if possible */
	GrowIfPossible,
	/** @name Don't shrink or grow */
	DontShrinkOrGrow
}

export enum FlexDirection {
	/** @name Row */
	Row = 'row',
	/** @name Column  */
	Column = 'column'
}

export enum FlexWrap {
	/** @name Don't wrap */
	Nowrap = 'nowrap',
	/** @name Wrap */
	Wrap = 'wrap'
}

export enum JustifyContent {
	/** @name JustifyStart @icon FlexJustifyStart */
	JustifyStart = 'flex-start',

	/** @name JustifyCenter @icon FlexJustifyCenter */
	JustifyCenter = 'center',

	/** @name JustifyEnd @icon FlexJustifyEnd*/
	JustifyEnd = 'flex-end',

	/** @name JustifySpaceBetween @icon FlexJustifySpaceBetween */
	JustifyBetween = 'space-between',

	/** @name JustifySpaceAround @icon FlexJustifySpaceAround */
	JustifyAround = 'space-around'
}

export enum AlignItems {
	/** @name AlignStart @icon FlexAlignStart */
	AlignStart = 'flex-start',

	/** @name AlignCenter @icon FlexAlignCenter */
	AlignCenter = 'center',

	/** @name AlignBottom @icon FlexAlignEnd */
	AlignEnd = 'flex-end',

	/** @name AlignStretch @icon FlexAlignStretch */
	AlignStrech = 'stretch',

	/** @name AlignBaseline @icon FlexAlignBaseline */
	AlignBaseline = 'baseline'
}

/**
 * @name  Box
 * @icon Box
 * @description for flexible layouts
 * @patternType synthetic:box
 */
export const Box: React.SFC<BoxProps> = props => {
	function buildFlexProperty() {
		switch (props.flex) {
			case Flex.ShrinkIfNeeded:
				return '0 1 auto';
			case Flex.GrowIfPossible:
				return '1 0 auto';
			case Flex.DontShrinkOrGrow:
				return '0 0 auto';
		}
	}

	return (
		<div
			style={{
				flexDirection: props.flexDirection,
				flexWrap: props.flexWrap,
				flex: buildFlexProperty(),
				alignItems: props.alignItems,
				display: 'flex',
				justifyContent: props.justifyContent,
				width: props.width,
				height: props.height,
				padding: props.padding,
				margin: props.margin,
				borderRadius: props.borderRadius,
				borderWidth: props.borderWidth,
				borderStyle: props.borderWidth === 'none' ? 'none' : 'solid',
				borderColor: props.borderColor,
				backgroundColor: props.backgroundColor
			}}
		>
			{props.children}
		</div>
	);
};
