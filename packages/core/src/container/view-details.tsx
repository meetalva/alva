import { AppPane } from './app-pane';
import * as Components from '../components';
import { ElementList } from './element-list';
import * as MobxReact from 'mobx-react';
import { PageListContainer } from './page-list/page-list-container';
import { PatternListContainer } from './pattern-list';
import { PreviewPaneWrapper } from './preview-pane-wrapper';
import { PropertyListContainer } from './property-list';
import { LibraryStoreContainer } from './library-store-container';
import * as React from 'react';
import * as ReactLoadable from 'react-loadable';
import * as Types from '../types';
import { ViewStore } from '../store';

const PaneDevelopmentEditor = ReactLoadable({
	loader: () => import('./pane-development-editor').then(m => m.PaneDevelopmentEditor),
	loading: () => null
});

@MobxReact.inject('store')
@MobxReact.observer
export class ViewDetails extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };

		return (
			<React.Fragment>
				{props.store.getApp().getProjectViewMode() === Types.ProjectViewMode.Design && (
					<>
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
					</>
				)}
				<div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
					{props.store.getApp().getProjectViewMode() === Types.ProjectViewMode.Libraries ? (
						<LibraryStoreContainer />
					) : (
						<PreviewPaneWrapper isDragging={props.store.getDragging()} key="center" />
					)}
					<AppPane
						pane={Types.AppPane.DevelopmentPane}
						defaultSize={{ width: '100%', height: 500 }}
						enable={{ top: true }}
						minHeight={240}
					>
						<PaneDevelopmentEditor />
					</AppPane>
				</div>
				{props.store.getApp().getProjectViewMode() !== Types.ProjectViewMode.Libraries && (
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
							<Components.PropertyPane>
								<PropertyListContainer />
							</Components.PropertyPane>
						</Components.SideBar>
					</AppPane>
				)}
			</React.Fragment>
		);
	}
}
