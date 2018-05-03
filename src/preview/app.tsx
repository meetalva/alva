import { Highlight } from './highlight';
import * as MobXReact from 'mobx-react';
import { PreviewComponent } from './preview-component';
import * as React from 'react';
import { Store } from './store/store';

export interface AppProps {
	connection: WebSocket;
}

@MobXReact.observer
export class App extends React.Component<AppProps> {
	public render(): JSX.Element | null {
		const page = Store.getInstance().page;
		if (!page) {
			return null;
		}

		const component = page.root;

		return (
			<React.Fragment>
				<PreviewComponent
					connection={this.props.connection}
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
