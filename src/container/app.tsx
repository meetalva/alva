import { ChromeContainer } from './chrome/chrome-container';
import * as Sender from '../message/client';
import {
	ElementPane,
	globalStyles,
	IconRegistry,
	Layout,
	LayoutBorder,
	LayoutDirection,
	LayoutSide,
	FixedArea,
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
import * as Types from '../types';
import * as uuid from 'uuid';

const Resizeable = require('re-resizable');

globalStyles();

interface InjectedAppProps {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedAppProps;

		if (props.store.getAppState() !== Types.AppState.Started) {
			return null;
		}

		return (
			<Layout direction={LayoutDirection.Column}>
				<FixedArea top={0} right={0} left={0}>
					<ChromeContainer />
				</FixedArea>
				<MainArea>
					{props.store.getActiveAppView() === Types.AlvaView.SplashScreen && (
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
					{props.store.getActiveAppView() === Types.AlvaView.Pages && (
						<PageListPreview>
							<PageListContainer />
						</PageListPreview>
					)}
					{props.store.getActiveAppView() === Types.AlvaView.PageDetail && (
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
									border={LayoutBorder.Side}
								>
									<ElementPane>
										<ElementList />
									</ElementPane>

									<Resizeable
										handleStyles={{ top: { zIndex: 1 } }}
										defaultSize={{ height: 500, width: '100%' }}
										enable={{ top: true }}
										minHeight={240}
									>
										<PatternsPane>
											<PatternListContainer />
										</PatternsPane>
									</Resizeable>
								</SideBar>
							</Resizeable>
							<PreviewPaneWrapper
								isDragging={props.store.getDragging()}
								key="center"
								previewFrame={`http://localhost:${props.store.getServerPort()}/preview.html`}
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
									{props.store.getPatternLibraryState() ===
										Types.PatternLibraryState.Pristine && (
										<ConnectPaneContainer
											onPrimaryButtonClick={() => props.store.connectPatternLibrary()}
										/>
									)}
									<PropertyPane>
										<PropertyListContainer />
									</PropertyPane>
								</SideBar>
							</Resizeable>
						</React.Fragment>
					)}
				</MainArea>
				<IconRegistry />
			</Layout>
		);
	}
}
