import { Chrome } from './container/chrome';
import { WebviewTag } from 'electron';
import ElementPane from '../lsg/patterns/panes/element-pane';
import { ElementList } from './container/element_list';
import globalStyles from '../lsg/patterns/global-styles';
import { IconName, IconRegistry } from '../lsg/patterns/icons';
import { JsonObject } from '../store/json';
import Layout, { MainArea, SideBar } from '../lsg/patterns/layout';
import { createMenu } from '../electron/menu';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { Page } from '../store/page';
import { PatternListContainer } from './container/pattern_list';
import PatternsPane from '../lsg/patterns/panes/patterns-pane';
import PreviewPane from '../lsg/patterns/panes/preview-pane';
import ProjectPane from '../lsg/patterns/panes/project-pane';
import { ProjectList } from './container/project_list';
import PropertyPane from '../lsg/patterns/panes/property-pane';
import { PropertyList } from './container/property_list';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from '../store';

globalStyles();

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
		this.handleMainWindowClick = this.handleMainWindowClick.bind(this);
	}

	private handleMainWindowClick(): void {
		this.props.store.setElementFocus(false);
		createMenu(store);
	}

	public render(): JSX.Element {
		// Todo: project and page don't update on page change
		const project = this.props.store.getCurrentProject();
		const page = this.props.store.getCurrentPage();
		const title = `${project && project.getName()} > ${page && page.getName()}`;

		let DevTools;
		try {
			const DevToolsExports = require('mobx-react-devtools');
			DevTools = DevToolsExports ? DevToolsExports.default : undefined;
		} catch (error) {
			// Ignored
		}

		return (
			<Layout directionVertical handleClick={this.handleMainWindowClick}>
				<Chrome title={title} />
				<MainArea>
					<SideBar directionVertical hasPaddings>
						<ElementPane>
							<ElementList store={this.props.store} />
						</ElementPane>
						<PatternsPane>
							<PatternListContainer store={this.props.store} />
						</PatternsPane>
					</SideBar>

					<PreviewPane />
					<SideBar directionVertical hasPaddings>
						<PropertyPane>
							<PropertyList store={this.props.store} />
						</PropertyPane>
						<ProjectPane>
							<ProjectList store={this.props.store} />
						</ProjectPane>
					</SideBar>
					<IconRegistry names={IconName} />
				</MainArea>
				{DevTools ? <DevTools /> : <div />}
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
