import { ChromeContainer } from './chrome/chrome-container';
import * as Sender from '../message/client';
import {
	AddButton,
	ElementPane,
	globalStyles,
	IconName,
	IconRegistry,
	Layout,
	LayoutBorder,
	LayoutDirection,
	LayoutSide,
	MainArea,
	PatternsPane,
	PropertyPane,
	SideBar
} from '../components';
import { ConnectPaneContainer } from './connect-pane-container';
import { ElementList } from './element-list';
import { ServerMessageType } from '../message';
import * as MobxReact from 'mobx-react';
import { PageListContainer } from './page-list/page-list-container';
import { PageListPreview } from './page-list/page-list-preview';
import { PatternListContainer } from './pattern-list';
import { PreviewPaneWrapper } from './preview-pane-wrapper';
import { PropertyListContainer } from './property-list';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import { ViewStore } from '../store';
import * as Types from '../model/types';
import * as uuid from 'uuid';

const Resizeable = require('re-resizable');

globalStyles();

@MobxReact.observer
export class App extends React.Component {
	private ctrlDown: boolean = false;
	private shiftDown: boolean = false;

	public componentDidMount(): void {
		this.redirectUndoRedo();
	}

	private redirectUndoRedo(): void {
		document.body.onkeydown = event => {
			if (event.keyCode === 16) {
				this.shiftDown = true;
			} else if (event.keyCode === 17 || event.keyCode === 91) {
				this.ctrlDown = true;
			} else if (this.ctrlDown && event.keyCode === 90) {
				event.preventDefault();
				if (this.shiftDown) {
					ViewStore.getInstance().redo();
				} else {
					ViewStore.getInstance().undo();
				}

				return false;
			}

			return true;
		};

		document.body.onkeyup = event => {
			if (event.keyCode === 16) {
				this.shiftDown = false;
			} else if (event.keyCode === 17 || event.keyCode === 91) {
				this.ctrlDown = false;
			}
		};
	}

	public render(): JSX.Element | null {
		const store = ViewStore.getInstance();

		if (store.getAppState() !== Types.AppState.Started) {
			return null;
		}

		return (
			<Layout direction={LayoutDirection.Column}>
				<ChromeContainer />
				<MainArea>
					{store.getActiveView() === Types.AlvaView.SplashScreen && (
						<SplashScreenContainer
							onPrimaryButtonClick={() => {
								Sender.send({
									type: ServerMessageType.CreateNewFileRequest,
									id: uuid.v4(),
									payload: undefined
								});
							}}
							onSecondaryButtonClick={() => {
								Sender.send({
									type: ServerMessageType.OpenFileRequest,
									id: uuid.v4(),
									payload: undefined
								});
							}}
						/>
					)}
					{store.getActiveView() === Types.AlvaView.Pages && (
						<PageListPreview>
							<PageListContainer />
						</PageListPreview>
					)}
					{store.getActiveView() === Types.AlvaView.PageDetail && (
						<React.Fragment>
							<Resizeable
								handleStyles={{ right: { zIndex: 1 } }}
								defaultSize={{ width: 240, height: '100%' }}
								enable={{ right: true }}
								minWidth={240}
							>
								<SideBar
									side={LayoutSide.Left}
									direction={LayoutDirection.Column}
									onClick={() => store.unsetSelectedElement()}
									border={LayoutBorder.Side}
								>
									<ElementPane>
										<ElementList />
									</ElementPane>
									<AddButton
										active={store.getRightPane() === Types.RightPane.Patterns}
										label="Add Elements"
										onClick={e => {
											e.stopPropagation();
											store.setRightPane(Types.RightPane.Patterns);
											store.unsetSelectedElement();
										}}
									/>
								</SideBar>
							</Resizeable>
							<PreviewPaneWrapper
								key="center"
								previewFrame={`http://localhost:${store.getServerPort()}/preview.html`}
							/>
							<Resizeable
								handleStyles={{ left: { zIndex: 1 } }}
								defaultSize={{ width: 240, height: '100%' }}
								enable={{ left: true }}
								minWidth={240}
							>
								<SideBar
									side={LayoutSide.Right}
									direction={LayoutDirection.Column}
									border={LayoutBorder.Side}
								>
									{store.getPatternLibraryState() ===
										Types.PatternLibraryState.Pristine && (
										<ConnectPaneContainer
											onPrimaryButtonClick={() => store.connectPatternLibrary()}
										/>
									)}
									{store.getRightPane() === Types.RightPane.Properties && (
										<PropertyPane>
											<PropertyListContainer />
										</PropertyPane>
									)}
									{store.getRightPane() === Types.RightPane.Patterns && (
										<PatternsPane>
											<PatternListContainer />
										</PatternsPane>
									)}
								</SideBar>
							</Resizeable>
						</React.Fragment>
					)}
				</MainArea>
				<IconRegistry names={IconName} />
			</Layout>
		);
	}
}
