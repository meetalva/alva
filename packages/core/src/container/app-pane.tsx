import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { WithStore } from '../store';
import * as Types from '../types';

export interface AppPaneProps {
	pane: Types.AppPane;
	force?: boolean;
	children: React.ReactNode;
	size?: { width: number | string; height: number | string };
	defaultSize?: { width: number | string; height: number | string };
	enable?: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
	minWidth?: number;
	minHeight?: number;
}

const Resizeable = require('re-resizable').default;

@MobxReact.inject('store')
@MobxReact.observer
export class AppPane extends React.Component<AppPaneProps> {
	public render(): JSX.Element | null {
		const props = this.props as AppPaneProps & WithStore;
		const app = props.store.getApp();

		if (!props.force && !app.isVisible(props.pane)) {
			return null;
		}

		const paneSize = props.size || props.pane ? app.getPaneSize(props.pane) : undefined;

		const defaultSize = paneSize
			? { width: paneSize.width, height: paneSize.height }
			: props.defaultSize;

		return (
			<Resizeable
				handleStyles={{ right: { zIndex: 1 } }}
				defaultSize={defaultSize}
				enable={props.enable}
				minWidth={props.minWidth}
				minHeight={props.minHeight}
				onResizeStop={(_: unknown, direction: string, el: HTMLElement) => {
					if (!props.pane) {
						return;
					}

					app.setPaneSize({
						pane: props.pane,
						width: direction === 'left' || direction === 'right' ? el.clientWidth : undefined,
						height:
							direction === 'top' || direction === 'bottom' ? el.clientHeight : undefined
					});
				}}
			>
				{this.props.children}
			</Resizeable>
		);
	}
}
