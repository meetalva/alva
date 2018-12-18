import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { WithStore } from '../store';
import * as Types from '../types';

export interface AppViewProps {
	view: Types.AlvaView;
}

@MobxReact.inject('store')
@MobxReact.observer
export class AppView extends React.Component<AppViewProps> {
	public render(): JSX.Element | null {
		const props = this.props as AppViewProps & WithStore;
		if (props.store.getApp().getActiveView() !== props.view) {
			return null;
		}

		return <>{this.props.children}</>;
	}
}
