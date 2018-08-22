import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { WithStore } from '../store';
import { LibrarySettingsContainer } from './library-settings-container';

@MobxReact.inject('store')
@MobxReact.observer
export class ProjectSettingsContainer extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as WithStore;

		return (
			<div>
				<Components.Headline order={3}>Connected Libraries</Components.Headline>
				{store
					.getPatternLibraries()
					.map(library => (
						<LibrarySettingsContainer key={library.getId()} library={library} />
					))}
			</div>
		);
	}
}
