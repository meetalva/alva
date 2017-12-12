import { Chrome } from './container/chrome';
import { WebviewTag } from 'electron';
import { ElementList } from './container/element_list';
import globalStyles from '../lsg/patterns/global-styles';
import { IconName, IconRegistry } from '../lsg/patterns/icons';
import { JsonObject } from '../store/json';
import Layout, { MainArea, SideBar } from '../lsg/patterns/layout';
import { createMenu } from './menu';
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
import styledComponents from 'styled-components';

globalStyles();

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
			store.openStyleguide('../designkit');
			store.openPage('homepage');
		});

		createMenu(store);
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
							<PropertyList store={this.props.store} />
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

MobX.autorun(() => {
	const page: Page | undefined = store.getCurrentPage();
	const message: JsonObject = {
		page: page ? page.toJsonObject() : undefined,
		pageId: page ? page.getId() : undefined
	};

	const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
	if (webviewTag && webviewTag.send) {
		webviewTag.send('page-change', message);
	}
});

MobX.autorun(() => {
	const message: JsonObject = { styleGuidePath: store.getStyleGuidePath() };

	const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
	if (webviewTag && webviewTag.send) {
		webviewTag.send('open-styleguide', message);
	}
});

ReactDom.render(<App store={store} />, document.getElementById('app'));
