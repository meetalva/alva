import { Highlight } from './highlight';
import * as MobXReact from 'mobx-react';
import { PreviewComponent } from './preview-component';
import * as React from 'react';
import { Store } from './store/store';

@MobXReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		const currentPage = Store.getInstance().getCurrentPage();
		if (!currentPage) {
			return null;
		}

		const component = currentPage.root;

		return (
			<React.Fragment>
				<PreviewComponent
					contents={component.contents}
					exportName={component.exportName}
					pattern={component.pattern}
					properties={component.properties}
					name={component.name}
					uuid={component.uuid}
				/>
				<Highlight />
			</React.Fragment>
		);
	}
}
