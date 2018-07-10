import { ChromeContainer } from './chrome/chrome-container';
import * as Sender from '../sender/client';
import * as Components from '../components';
import { ConnectPaneContainer } from './connect-pane-container';
import { ElementList } from './element-list';
import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import { PageListContainer } from './page-list/page-list-container';
import { PatternListContainer } from './pattern-list';
import { PreviewPaneWrapper } from './preview-pane-wrapper';
import { PropertyListContainer } from './property-list';
import { PropertiesSwitch } from './properties-switch';
import { ProjectSettingsContainer } from './project-settings-container';
import * as React from 'react';
import { SplashScreenContainer } from './splash-screen-container';
import { ViewStore } from '../store';
import * as Types from '../types';
import * as uuid from 'uuid';

const Resizeable = require('re-resizable');

Components.globalStyles();

interface InjectedAppProps {
	store: ViewStore;
}

@MobxReact.inject('store')
@MobxReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedAppProps;
		const app = props.store.getApp();

		if (app.getState() !== Types.AppState.Started) {
			return null;
		}

		return (
			<Components.Layout direction={Components.LayoutDirection.Column}>
				<Components.FixedArea top={0} right={0} left={0}>
					<ChromeContainer />
				</Components.FixedArea>
				<Components.MainArea>
					{props.store.getActiveAppView() === Types.AlvaView.SplashScreen && (
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
					)}
					{props.store.getActiveAppView() === Types.AlvaView.PageDetail && (
						<React.Fragment>
							{app.getPanes().has(Types.AppPane.PagesPane) && (
								<Resizeable
									handleStyles={{ right: { zIndex: 1 } }}
									defaultSize={{ width: 140, height: '100%' }}
									enable={{ right: true }}
									minWidth={140}
								>
									<Components.SideBar
										side={Components.LayoutSide.Left}
										direction={Components.LayoutDirection.Column}
										border={Components.LayoutBorder.Side}
									>
										<PageListContainer />
									</Components.SideBar>
								</Resizeable>
							)}
							{app.getPanes().has(Types.AppPane.ElementsPane) && (
								<Resizeable
									handleStyles={{ right: { zIndex: 1 } }}
									defaultSize={{ width: 240, height: '100%' }}
									enable={{ right: true }}
									minWidth={240}
								>
									<Components.SideBar
										side={Components.LayoutSide.Left}
										direction={Components.LayoutDirection.Column}
										border={Components.LayoutBorder.Side}
									>
										<Components.ElementPane>
											<ElementList />
										</Components.ElementPane>

										<Resizeable
											handleStyles={{ top: { zIndex: 1 } }}
											defaultSize={{ height: 500, width: '100%' }}
											enable={{ top: true }}
											minHeight={240}
										>
											<Components.PatternsPane>
												<PatternListContainer />
											</Components.PatternsPane>
										</Resizeable>
									</Components.SideBar>
								</Resizeable>
							)}
							<PreviewPaneWrapper
								isDragging={props.store.getDragging()}
								key="center"
								previewFrame={`http://localhost:${props.store.getServerPort()}/preview.html`}
							/>

							{app.getPanes().has(Types.AppPane.PropertiesPane) && (
								<Resizeable
									handleStyles={{ left: { zIndex: 1 } }}
									defaultSize={{ width: 240, height: '100%' }}
									enable={{ left: true }}
									minWidth={240}
								>
									<Components.SideBar
										side={Components.LayoutSide.Right}
										direction={Components.LayoutDirection.Column}
										border={Components.LayoutBorder.Side}
									>
										<div style={{ flexShrink: 0, height: 40 }}>
											<PropertiesSwitch />
										</div>
										{props.store
											.getPatternLibraries()
											.every(
												lib => lib.getOrigin() === Types.PatternLibraryOrigin.BuiltIn
											) && (
											<ConnectPaneContainer
												onPrimaryButtonClick={() => props.store.connectPatternLibrary()}
												onSecondaryButtonClick={() =>
													Sender.send({
														type: MessageType.OpenExternalURL,
														id: uuid.v4(),
														payload: 'http://meetalva.github.io/example/example.alva'
													})
												}
											/>
										)}
										<Components.PropertyPane>
											{props.store.getApp().getRightSidebarTab() ===
												Types.RightSidebarTab.Properties && <PropertyListContainer />}
											{props.store.getApp().getRightSidebarTab() ===
												Types.RightSidebarTab.ProjectSettings && (
												<ProjectSettingsContainer />
											)}
										</Components.PropertyPane>
									</Components.SideBar>
								</Resizeable>
							)}
						</React.Fragment>
					)}
				</Components.MainArea>
				<Components.IconRegistry />
			</Components.Layout>
		);
	}
}
