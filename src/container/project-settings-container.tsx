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
				<Components.Space sizeBottom={SpaceSize.XS}>
					<Components.Headline type="primary" order={3}>
						Connected Libraries
					</Components.Headline>
					<Components.Copy textColor={Color.Grey50}>
						You can connect one or multiple React component libraries.
					</Components.Copy>
				</Components.Space>
				<Components.Space sizeBottom={SpaceSize.XL}>
					<Components.Link
						underline={true}
						color={Color.Grey50}
						onClick={() =>
							store.getSender().send({
								type: MessageType.OpenExternalURL,
								id: uuid.v4(),
								payload: 'https://github.com/meetalva/alva#pattern-requirements'
							})
						}
					>
						See Library Requirements
					</Components.Link>
				</Components.Space>
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
						store.getSender().send({
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
