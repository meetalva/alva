import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import * as uuid from 'uuid';
import { ViewStore } from '../store';

@MobxReact.inject('store')
@MobxReact.observer
export class ViewSplashscreen extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };

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
						id: uuid.v4(),
						payload: undefined
					});
				}}
				onGuideClick={() => {
					props.store.getSender().send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://meetalva.io/doc/docs/guides/start'
					});
				}}
			/>
		);
	}
}
