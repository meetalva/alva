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
export declare enum FlexDirection {
	Vertical = 'column',
	Horizontal = 'row'
}
export declare enum FlexAlignHorizontal {
	Left = 'flex-start',
	Center = 'center',
	Right = 'flex-end',
	Stretch = 'stretch',
	SpaceBetween = 'space-between',
	SpaceAround = 'space-around',
	SpaceEvenly = 'space-evenly'
}
export declare enum FlexAlignVertical {
	Top = 'flex-start',
	Center = 'center',
	Bottom = 'flex-end',
	Stretch = 'stretch',
	SpaceBetween = 'space-between',
	SpaceAround = 'space-around',
	SpaceEvenly = 'space-evenly'
}
export declare const Box: React.SFC<BoxProps>;
