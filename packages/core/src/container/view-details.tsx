import { AppPane } from './app-pane';
import * as Components from '@meetalva/components';
import { ElementList } from './element-list';
import * as MobxReact from 'mobx-react';
import { PageListContainer } from './page-list/page-list-container';
import { PatternListContainer } from './pattern-list';
import { PreviewPaneWrapper } from './preview-pane-wrapper';
import { PropertyListContainer } from './property-list';
import { LibraryStoreContainer } from './library-store-container';
import * as React from 'react';
import * as ReactLoadable from 'react-loadable';
import * as Types from '@meetalva/types';
import { ViewStore } from '../store';
import { When } from './when';
import { Match, MatchBranch } from './match';

const PaneDevelopmentEditor = ReactLoadable({
	loader: () => import('./pane-development-editor').then(m => m.PaneDevelopmentEditor),
	loading: () => null
});

@MobxReact.inject('store')
@MobxReact.observer
export class ViewDetails extends React.Component {
	public render(): JSX.Element {
		const props = this.props as { store: ViewStore };
		const viewMode = props.store.getApp().getProjectViewMode();
		const isDesign = viewMode === Types.ProjectViewMode.Design;

		return (
			<React.Fragment>
				<When isDesign={isDesign}>
					<EditorSidebars />
				</When>
				<Components.Flex flexGrow={1} flexDirection={Components.FlexDirection.Column}>
					<Match value={viewMode}>
						<MatchBranch when={Types.ProjectViewMode.Design}>
							<PreviewPaneWrapper isDragging={props.store.getDragging()} />
							<AppPane
								pane={Types.AppPane.DevelopmentPane}
								defaultSize={{ width: '100%', height: 500 }}
								enable={{ top: true }}
								minHeight={240}
							>
								<PaneDevelopmentEditor />
							</AppPane>
						</MatchBranch>
						<MatchBranch when={Types.ProjectViewMode.Libraries}>
							<LibraryStoreContainer />
						</MatchBranch>
					</Match>
				</Components.Flex>
				<When isDesign={isDesign}>
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
				</When>
			</React.Fragment>
		);
	}
}

@MobxReact.observer
export class EditorSidebars extends React.Component {
	public render(): JSX.Element {
		return (
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
		);
	}
}
