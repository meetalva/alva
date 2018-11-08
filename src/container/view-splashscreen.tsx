import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import * as uuid from 'uuid';
import { ViewStore } from '../store';
import * as Yaml from 'js-yaml';
import * as Types from '../types';

@MobxReact.inject('store')
@MobxReact.observer
export class ViewSplashscreen extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };
		const sender = props.store.getSender();
		const openFileRequestId = uuid.v4();

		return (
			<SplashScreenContainer
				onCreateClick={() => {
					props.store.getSender().send({
						type: MessageType.CreateNewFileRequest,
						id: uuid.v4(),
						payload: undefined
					});
				}}
				onOpenClick={() => {
					props.store.getSender().send({
						type: MessageType.OpenFileRequest,
						id: openFileRequestId,
						payload: undefined
					});
				}}
				onGuideClick={() => {
					props.store.getSender().send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://meetalva.io/doc/docs/guides/start?guides-enabled=true'
					});
				}}
				onOpenFile={e => {
					// TODO: Move to fallback host?
					if (e.target.files === null) {
						return;
					}

					const file = e.target.files[0];

					if (!file) {
						return;
					}

					const reader = new FileReader();
					reader.readAsText(file, 'UTF-8');

					reader.onload = o => {
						if (!o.target) {
							return;
						}

						const contents = Yaml.safeLoad(
							reader.result as string
						) as Types.SerializedProject;

						// TODO: Send to server for temporary storage
						sender.send({
							type: MessageType.OpenFileResponse,
							id: openFileRequestId,
							payload: {
								contents,
								path: file.name,
								status: Types.ProjectPayloadStatus.Ok
							}
						});
					};

					reader.onerror = err => {
						sender.send({
							type: MessageType.OpenFileResponse,
							id: openFileRequestId,
							payload: {
								error: new Error('Error reading file'),
								status: Types.ProjectPayloadStatus.Error
							}
						});
					};
				}}
			/>
		);
	}
}
