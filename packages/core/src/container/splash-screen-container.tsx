import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { SplashScreenView } from './splash-screen-view';
import * as uuid from 'uuid';
import { ViewStore } from '../store';
import { FileInput } from './file-input';
import * as C from '../components';

@MobxReact.inject('store')
@MobxReact.observer
export class SplashScreenContainer extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };
		const app = props.store.getApp();
		const transaction = uuid.v4();
		const openFileRequestId = uuid.v4();

		return (
			<SplashScreenView
				openFileSlot={
					<C.ButtonGroupButton
						as={app.hasFileAccess() ? 'button' : 'label'}
						onClick={() => {
							app.send({
								type: MessageType.OpenFileRequest,
								transaction,
								id: openFileRequestId,
								payload: {
									replace: false
								}
							});
						}}
						style={{ width: '50%', height: 42 }}
					>
						Open File
						{!app.hasFileAccess() && (
							<FileInput
								accept=".alva"
								onChange={contents => {
									app.send({
										type: MessageType.UseFileRequest,
										transaction,
										id: openFileRequestId,
										payload: {
											silent: false,
											replace: false,
											contents
										}
									});
								}}
							/>
						)}
					</C.ButtonGroupButton>
				}
				onCreateClick={() => {
					app.send({
						type: MessageType.CreateNewFileRequest,
						transaction,
						id: uuid.v4(),
						payload: {
							replace: false
						}
					});
				}}
				onGuideClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://meetalva.io/doc/docs/guides/start?guides-enabled=true'
					});
				}}
				onExampleClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://media.meetalva.io/file/Website.alva'
					});
				}}
				onGithubClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://github.com/meetalva/alva'
					});
				}}
				onChatClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://gitter.im/meetalva'
					});
				}}
				onWebsiteClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'https://meetalva.io'
					});
				}}
				onMailClick={() => {
					app.send({
						type: MessageType.OpenExternalURL,
						id: uuid.v4(),
						payload: 'mailto:hey@meetalva.io'
					});
				}}
			/>
		);
	}
}
