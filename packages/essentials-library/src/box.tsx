import * as React from 'react';

export interface BoxProps {
	/** @name Flex @default true */
	flex?: boolean;

	/** @name Direction @default Vertical @group Alignment */
	flexDirection?: FlexDirection;

	/** @name Horizontal @default Center @group Alignment */
	horizontal?: FlexAlignHorizontal;

	/** @name Vertical @default Center @group Alignment */
	vertical?: FlexAlignVertical;

	/** @name Wrap */
	wrap?: boolean;

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

	/** @name Background Color */
	backgroundColor?: string;

	children?: React.ReactNode;
}

export enum FlexDirection {
	Vertical = 'column',
	Horizontal = 'row'
}

export enum FlexAlignHorizontal {
	Left = 'flex-start',
	Center = 'center',
	Right = 'flex-end',
	Stretch = 'stretch',
	SpaceBetween = 'space-between',
	SpaceAround = 'space-around',
	SpaceEvenly = 'space-evenly'
}

export enum FlexAlignVertical {
	Top = 'flex-start',
	Center = 'center',
	Bottom = 'flex-end',
	Stretch = 'stretch',
	SpaceBetween = 'space-between',
	SpaceAround = 'space-around',
	SpaceEvenly = 'space-evenly'
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
				flexWrap: props.wrap ? 'wrap' : 'nowrap',
				flexGrow: props.flexGrow,
				flexShrink: props.flexShrink,
				alignItems:
					props.flexDirection === FlexDirection.Horizontal ? props.vertical : props.horizontal,
				display: props.flex ? 'flex' : 'block',
				justifyContent:
					props.flexDirection === FlexDirection.Horizontal ? props.horizontal : props.vertical,
				width: props.width,
				height: props.height,
				backgroundColor: props.backgroundColor
			}}
		>
			{props.children}
		</div>
	);
};
