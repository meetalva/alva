import { AppPane } from './app-pane';
import * as Components from '../components';
import { ConnectPaneContainer } from './connect-pane-container';
import { ElementList } from './element-list';
import { MessageType } from '../message';
import * as MobxReact from 'mobx-react';
import { PaneDevelopmentEditor } from './pane-development-editor';
import { PageListContainer } from './page-list/page-list-container';
import { PatternListContainer } from './pattern-list';
import { PreviewPaneWrapper } from './preview-pane-wrapper';
import { PropertyListContainer } from './property-list';
import { PropertiesSwitch } from './properties-switch';
import { ProjectSettingsContainer } from './project-settings-container';
import * as React from 'react';
import * as Types from '../types';
import * as uuid from 'uuid';
import { ViewStore } from '../store';

@MobxReact.inject('store')
@MobxReact.observer
export class ViewDetails extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };

		/**
		 * TODO: Remove before releasing BETA
		 * Hack for backwards compat with versions that computed js output instead of saving -
		 * for those we have to transpile the ts payload once, thus create an editor
		 */
		const forceEditor =
			!props.store.getApp().isVisible(Types.AppPane.DevelopmentPane) &&
			typeof props.store
				.getProject()
				.getUserStore()
				.getEnhancer()
				.getJavaScript() === 'undefined';

		const onlyBuiltin = props.store
			.getPatternLibraries()
			.every(lib => lib.getOrigin() === Types.PatternLibraryOrigin.BuiltIn);

		const mayConnect = props.store.getApp().hasFileAccess();

		return (
			<React.Fragment>
				<AppPane
					pane={Types.AppPane.PagesPane}
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
				</AppPane>
				<AppPane
					pane={Types.AppPane.ElementsPane}
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

						<AppPane
							force
							pane={Types.AppPane.PatternsPane}
							defaultSize={{ height: 500, width: '100%' }}
							enable={{ top: true }}
							minHeight={240}
						>
							<Components.PatternsPane>
								<PatternListContainer />
							</Components.PatternsPane>
						</AppPane>
					</Components.SideBar>
				</AppPane>
				<div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
					<PreviewPaneWrapper
						isDragging={props.store.getDragging()}
						key="center"
						previewFrame={`http://localhost:${props.store.getServerPort()}/preview/${props.store
							.getProject()
							.getId()}`}
					/>
					<AppPane
						pane={Types.AppPane.DevelopmentPane}
						defaultSize={{ width: '100%', height: 500 }}
						enable={{ top: true }}
						minHeight={240}
					>
						<PaneDevelopmentEditor />
					</AppPane>
					{forceEditor && (
						<div style={{ position: 'fixed', top: '100vh' }}>
							<PaneDevelopmentEditor />
						</div>
					)}
				</div>
				<AppPane
					pane={Types.AppPane.PropertiesPane}
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
						{onlyBuiltin &&
							mayConnect && (
								<ConnectPaneContainer
									onPrimaryButtonClick={() => props.store.connectPatternLibrary()}
									onSecondaryButtonClick={() =>
										props.store.getSender().send({
											type: MessageType.OpenExternalURL,
											id: uuid.v4(),
											payload: 'https://media.meetalva.io/file/Website.alva'
										})
									}
								/>
							)}
						<Components.PropertyPane>
							{props.store.getApp().getRightSidebarTab() ===
								Types.RightSidebarTab.Properties && <PropertyListContainer />}
							{props.store.getApp().getRightSidebarTab() ===
								Types.RightSidebarTab.ProjectSettings && <ProjectSettingsContainer />}
						</Components.PropertyPane>
					</Components.SideBar>
				</AppPane>
			</React.Fragment>
		);
	}
}
