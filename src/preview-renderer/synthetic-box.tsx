import * as React from 'react';

export interface SyntheticBoxProps {
	alignItems: '';
	flex: boolean;
	flexBasis: number;
	column: boolean;
	wrap: boolean;
	flexGrow: number | 'inherit' | 'initial' | 'revert' | 'unset' | undefined;
	flexShrink: number;
	justifyContent: '';
	order: number;
	width: number | string;
	height: number | string;
	backgroundColor: string;
}

export const SyntheticBox: React.SFC<SyntheticBoxProps> = props => (
	<div
		style={{
			alignItems: props.alignItems,
			display: props.flex ? 'flex' : 'block',
			flexBasis: props.flexBasis,
			// tslint:disable-next-line:no-any
			flexDirection: props.column ? 'column' : (null as any),
			// tslint:disable-next-line:no-any
			flexWrap: props.wrap ? 'wrap' : ('nowrap' as any),
			flexGrow: props.flexGrow,
			flexShrink: props.flexShrink,
			justifyContent: props.justifyContent,
			order: props.order,
			width: props.width,
			height: props.height,
			backgroundColor: props.backgroundColor
		}}
	>
		{props.children}
	</div>
);
