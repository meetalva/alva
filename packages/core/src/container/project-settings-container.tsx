import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { WithStore } from '../store';
import { LibrarySettingsContainer } from './library-settings-container';
import { SpaceSize } from '../components/space';
import { Color } from '../components/colors';
import { MessageType } from '../message';
import * as uuid from 'uuid';

@MobxReact.inject('store')
@MobxReact.observer
export class ProjectSettingsContainer extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as WithStore;
		const app = store.getApp();

		return (
			<div>
				<Components.Headline order={4}>Connected Libraries</Components.Headline>
				<Components.Space sizeBottom={SpaceSize.S} />
				<Components.Copy textColor={Color.Grey50}>
					Connect multiple component libraries to your prototype. Select the package.json file
					of your React &amp; Typescript library.
				</Components.Copy>
				<Components.Space sizeBottom={SpaceSize.XS} />
				<Components.Link
					underline={true}
					color={Color.Grey50}
					onClick={() =>
						store.getApp().send({
							type: MessageType.OpenExternalURL,
							id: uuid.v4(),
							payload:
								'https://meetalva.io/doc/docs/references/library-requirements.html?vvtjrhvg_p-enabled=true'
						})
					}
				>
					Library Requirements
				</Components.Link>
				<Components.Space sizeBottom={SpaceSize.XXS} />
				<Components.Link
					underline={true}
					color={Color.Grey50}
					onClick={() =>
						store.getApp().send({
							type: MessageType.OpenExternalURL,
							id: uuid.v4(),
							payload: 'https://media.meetalva.io/file/Website.alva'
						})
					}
				>
					Download Example File with Library
				</Components.Link>
				<Components.Space sizeBottom={SpaceSize.XL} />
				{store
					.getPatternLibraries()
					.map(library => (
						<LibrarySettingsContainer key={library.getId()} library={library} />
					))}
				<Components.AddButton
					title={
						app.hasFileAccess()
							? ''
							: 'Local library connect not available without file access'
					}
					disabled={!app.hasFileAccess()}
					onClick={() =>
						store.getApp().send({
							id: uuid.v4(),
							payload: { library: undefined, projectId: store.getProject().getId() },
							type: MessageType.ConnectPatternLibraryRequest
						})
					}
				>
					Connect Library
				</Components.AddButton>
			</div>
		);
	}
}
