import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import * as uuid from 'uuid';
import { ViewStore } from '../store';
import * as Types from '../types';

@MobxReact.inject('store')
@MobxReact.observer
export class ViewSplashscreen extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };
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
					if (!props.store.getApp().isHostType(Types.HostType.Electron)) {
						return;
					}

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
				onOpenFile={contents => {
					props.store.getSender().send({
						type: MessageType.UseFileRequest,
						id: openFileRequestId,
						payload: {
							silent: false,
							contents
						}
					});
				}}
			/>
		);
	}
}
