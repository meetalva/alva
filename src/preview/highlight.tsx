import * as MobXReact from 'mobx-react';
import * as React from 'react';
import { Store } from './store/store';

@MobXReact.observer
export class Highlight extends React.Component {
	public render(): JSX.Element {
		const highlightProps = Store.getInstance().highlightArea.getProps();

		return (
			<div
				style={{
					position: 'absolute',
					boxSizing: 'border-box',
					border: '1px dashed rgba(55, 55, 55, .5)',
					background: `
					repeating-linear-gradient(
						135deg,
						transparent,
						transparent 2.5px,rgba(51, 141, 222, .5) 2.5px,
						rgba(51,141,222, .5) 5px),
						rgba(102,169,230, .5)`,
					transition: 'all .25s ease-in-out',
					bottom: highlightProps.bottom,
					height: highlightProps.height,
					left: highlightProps.left,
					opacity: highlightProps.opacity,
					right: highlightProps.right,
					top: highlightProps.top,
					width: highlightProps.width
				}}
			/>
		);
	}
}
