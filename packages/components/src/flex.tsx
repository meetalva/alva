import * as React from 'react';

export interface FlexProps {
	flex?: boolean;
	flexDirection?: FlexDirection;
	justifyContent?: FlexJustifyContent;
	alignItems?: FlexAlignItems;
	flexWrap?: boolean;
	flexBasis?: number;
	flexGrow?: number;
	flexShrink?: number;
	children?: React.ReactNode;
	style?: React.CSSProperties;
}

export enum FlexDirection {
	Row = 'row',
	Column = 'column'
}

export enum FlexJustifyContent {
	FlexStart = 'flex-start',
	Center = 'center',
	FlexEnd = 'flex-end',
	SpaceBetween = 'space-between',
	SpaceAround = 'space-around',
	SpaceEvenly = 'space-evenly'
}

export enum FlexAlignItems {
	FlexStart = 'flex-start',
	Center = 'center',
	FlexEnd = 'flex-end',
	Stretch = 'stretch',
	Baseline = 'baseline'
}

export const Flex: React.SFC<FlexProps> = props => {
	return (
		<div
			style={{
				...props.style,
				flexBasis: props.flexBasis,
				flexDirection: props.flexDirection,
				flexWrap: props.flexWrap ? 'wrap' : 'nowrap',
				flexGrow: props.flexGrow,
				flexShrink: props.flexShrink,
				alignItems: props.alignItems,
				display: props.flex !== false ? 'flex' : 'block',
				justifyContent: props.justifyContent
			}}
		>
			{props.children}
		</div>
	);
};
