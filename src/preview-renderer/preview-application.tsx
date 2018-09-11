import * as MobxReact from 'mobx-react';
import { PreviewComponent } from './preview-component';
import * as React from 'react';
import { Injection } from '.';

@MobxReact.inject('store')
@MobxReact.observer
export class PreviewApplication extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as Injection;
		const activePage = props.store.getActivePage();

		if (!activePage) {
			return null;
		}

		const element = activePage.getRoot();

		if (!element) {
			return null;
		}

		return <PreviewComponent element={element} />;
	}
}
