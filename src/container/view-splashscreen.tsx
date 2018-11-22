import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import * as uuid from 'uuid';
import { ViewStore } from '../store';
// import * as Types from '../types';

@MobxReact.inject('store')
@MobxReact.observer
export class ViewSplashscreen extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };
		const app = props.store.getApp();
		const transaction = uuid.v4();
		const openFileRequestId = uuid.v4();

		return (
			<SplashScreenContainer
				onCreateClick={() => {
					app.send({
						type: MessageType.CreateNewFileRequest,
						transaction,
						id: uuid.v4(),
						payload: undefined
					});
				}}
				onOpenClick={() => {
					app.send({
						type: MessageType.OpenFileRequest,
						transaction,
						id: openFileRequestId,
						payload: undefined
					});
				}}
				onGuideClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://meetalva.io/doc/docs/guides/start?guides-enabled=true'
					});
				}}
				onOpenFile={contents => {
					app.send({
						type: MessageType.UseFileRequest,
						transaction,
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
