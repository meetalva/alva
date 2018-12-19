import * as React from 'react';

// tslint:disable-next-line:no-any
export const SyntheticImage: React.SFC<any> = props =>
	props.src ? (
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
	) : null;
