import { Chrome } from './container/chrome';
import { WebviewTag } from 'electron';
import { ElementList } from './container/element_list';
import { IconName, IconRegistry } from '../lsg/patterns/icons';
import Layout from '../lsg/patterns/layout';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import { Page } from '../store/page';
import { PatternList } from './container/pattern_list';
import { ProjectList } from './container/project_list';
import { PropertyList } from './container/property_list';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store';
import styledComponents, { injectGlobal } from 'styled-components';
import TabNavigation, { TabNavigationItem } from '../lsg/patterns/tab-navigation';

// Global style
// tslint:disable-next-line:no-unused-expression
injectGlobal`
  body {
    margin: 0;
    background-color: #ffffff;
  }
`;

const ElementPane = styledComponents(Layout)`
	flex-basis: 350px;
`;

const ProjectsPane = styledComponents.div`
	flex: 2 0 0px;
	border-bottom: 1px solid #ccc;
`;

const PatternsPane = styledComponents.div`
	flex: 3 0 0px;
`;

const PreviewPane = styledComponents.div`
	flex: 2 0 0px;
	border-radius: 10px;
	box-shadow: 0 2px 10px 0 rgba(0,0,0,.13);
	overflow: hidden;
`;

interface AppProps {
	store: Store;
}

@observer
class App extends React.Component<AppProps> {
	private static PatternListID = 'patternlist';
	private static PropertiesListID = 'propertieslist';

	@MobX.observable protected activeTab: string = App.PatternListID;
	@MobX.computed
	protected get isPatternListVisible(): boolean {
		return Boolean(this.activeTab === App.PatternListID);
	}
	@MobX.computed
	protected get isPropertiesListVisible(): boolean {
		return Boolean(this.activeTab === App.PropertiesListID);
	}

	public constructor(props: AppProps) {
		super(props);
		this.handleTabNaviagtionClick = this.handleTabNaviagtionClick.bind(this);
	}

	public componentDidMount(): void {
		const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
		webviewTag.addEventListener('did-stop-loading', () => {
			store.openStyleguide('../stacked-example');
			store.openPage('my-project', 'mypage');
		});
	}

	public render(): JSX.Element {
		// Todo: project and page don't update on page change
		const project = this.props.store.getCurrentProject();
		const page = this.props.store.getCurrentPage();
		const title = `${project && project.getName()} - ${page && page.getName()}`;

		return (
			<Layout directionVertical>
				<Chrome title={title} />
				<Layout>
					<Layout directionVertical hasMargins>
						<ProjectsPane>
							<ProjectList store={this.props.store} />
						</ProjectsPane>

						<PatternsPane>
							<Layout>
								<TabNavigation>
									<TabNavigationItem
										active={this.isPatternListVisible}
										onClick={event =>
											this.handleTabNaviagtionClick(event, App.PatternListID)
										}
										tabText="Patterns"
									/>
									<TabNavigationItem
										active={this.isPropertiesListVisible}
										onClick={event =>
											this.handleTabNaviagtionClick(event, App.PropertiesListID)
										}
										tabText="Properties"
									/>
								</TabNavigation>
							</Layout>
							{this.isPatternListVisible && <PatternList store={this.props.store} />}
							{this.isPropertiesListVisible && <PropertyList store={this.props.store} />}
						</PatternsPane>
					</Layout>

					<PreviewPane
						dangerouslySetInnerHTML={{
							__html:
								'<webview id="preview" style="height: 100%;" src="./preview.html" partition="electron" nodeintegration />'
						}}
					/>

					<ElementPane directionVertical hasMargins>
						<ElementList store={this.props.store} />
					</ElementPane>

					<IconRegistry names={IconName} />
				</Layout>
				<DevTools />
			</Layout>
		);
	}

	@MobX.action
	protected handleTabNaviagtionClick(evt: React.MouseEvent<HTMLElement>, id: string): void {
		this.activeTab = id;
	}
}

const store = new Store();

MobX.observe(store, (change: MobX.IObjectChange) => {
	const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
	if (!webviewTag || !webviewTag.send) {
		return;
	}

	if (change.object === store && change.name === 'styleGuidePath') {
		webviewTag.send('open-styleguide', {
			styleGuidePath: store.getStyleGuidePath()
		});
	} else {
		const page: Page | undefined = store.getCurrentPage();
		webviewTag.send('page-change', {
			page: page ? page.toJson() : undefined,
			pageId: page ? page.getPageId() : undefined,
			projectId: page ? page.getProjectId() : undefined
		});
	}
});

ReactDom.render(<App store={store} />, document.getElementById('app'));
