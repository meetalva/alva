import { Chrome } from './container/chrome';
import { WebviewTag } from 'electron';
import { ElementList } from './container/element_list';
import { IconName, IconRegistry } from '../lsg/patterns/icons';
import { fonts } from '../lsg/patterns/fonts/index';
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

// Global style
// tslint:disable-next-line:no-unused-expression
injectGlobal`
	body {
		margin: 0;
		background-color: #f7f7f7;
		font-family: ${fonts().NORMAL_FONT};
		font-size: 12px;
	}
`;

const MainArea = styledComponents(Layout)`
	box-sizing: border-box;
	height: 100vh;
	padding-top: 38px;
`;

const SideBar = styledComponents(Layout)`
	flex-basis: 240px;
	overflow-y: scroll;
`;

const ElementPane = styledComponents.div`
	flex: 2 0 0px;
`;

const PropertyPane = styledComponents.div`
	flex: 2 0 0px;
`;

const PatternsPane = styledComponents.div`
	flex: 3 0 0px;
`;

const ProjectPane = styledComponents.div`
	flex: 3 0 0px;
`;

const PreviewPane = styledComponents.div`
	flex: 2 0 0px;
	background-color: #ffffff;
	border-radius: 10px 10px 0 0;
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
				<MainArea>
					<SideBar directionVertical hasMargins>
						<ElementPane>
							<ElementList store={this.props.store} />
						</ElementPane>
						<PatternsPane>
							<PatternList store={this.props.store} />
						</PatternsPane>
					</SideBar>

					<PreviewPane
						dangerouslySetInnerHTML={{
							__html:
								'<webview id="preview" style="height: 100%;" src="./preview.html" partition="electron" nodeintegration />'
						}}
					/>
					<SideBar directionVertical hasMargins>
						<PropertyPane>
							<PropertyList
							handlePropertyChange={handleStoreChange}
							store={this.props.store}
							/>
						</PropertyPane>
						<ProjectPane>
							<ProjectList store={this.props.store} />
						</ProjectPane>
					</SideBar>
					<IconRegistry names={IconName} />
				</MainArea>
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

const handleStoreChange = () => {
	const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
	const page: Page | undefined = store.getCurrentPage();
	webviewTag.send('page-change', {
		page: page ? page.toJson() : undefined,
		pageId: page ? page.getPageId() : undefined,
		projectId: page ? page.getProjectId() : undefined
	});
};

MobX.observe(store, (change: MobX.IObjectChange) => {
	const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
	if (!webviewTag || !webviewTag.send) {
		return;
	}

	if (change.object === store && change.name === 'styleGuidePath') {
		console.log('open-styleguide');
		webviewTag.send('open-styleguide', {
			styleGuidePath: store.getStyleGuidePath()
		});
	} else {
		handleStoreChange();
	}
});

ReactDom.render(<App store={store} />, document.getElementById('app'));
