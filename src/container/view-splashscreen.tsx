import * as Sender from '../sender/client';
import { MessageType } from '../message';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import * as uuid from 'uuid';

export class ViewSplashscreen extends React.Component {
	public render(): JSX.Element {
		return (
			<SplashScreenContainer
				onPrimaryButtonClick={() => {
					Sender.send({
						type: MessageType.CreateNewFileRequest,
						id: uuid.v4(),
						payload: undefined
					});
				}}
				onSecondaryButtonClick={() => {
					Sender.send({
						type: MessageType.OpenFileRequest,
						id: uuid.v4(),
						payload: undefined
					});
				}}
			/>
		);
	}
}
