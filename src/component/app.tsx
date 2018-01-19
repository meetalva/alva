import Button, { Order } from '../lsg/patterns/button';
import { Chrome } from './container/chrome';
import { colors } from '../lsg/patterns/colors';
import Copy, { Size as CopySize } from '../lsg/patterns/copy';
import { remote, webFrame, WebviewTag } from 'electron';
import ElementPane from '../lsg/patterns/panes/element-pane';
import { ElementList } from './container/element_list';
import * as FileExtraUtils from 'fs-extra';
import globalStyles from '../lsg/patterns/global-styles';
import { Headline } from '../lsg/patterns/headline';
import { IconName, IconRegistry } from '../lsg/patterns/icons';
import { JsonObject } from '../store/json';
import Layout, { MainArea, SideBar } from '../lsg/patterns/layout';
import Link from '../lsg/patterns/link';
import { createMenu } from '../electron/menu';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { Page } from '../store/page/page';
import { PageList } from './container/page_list';
import * as PathUtils from 'path';
import { PatternListContainer } from './container/pattern_list';
import PatternsPane from '../lsg/patterns/panes/patterns-pane';
import PreviewPane from '../lsg/patterns/panes/preview-pane';
import * as ProcessUtils from 'process';
import { ProjectList } from './container/project_list';
import PropertyPane from '../lsg/patterns/panes/property-pane';
import { PropertyList } from './container/property_list';
const { app, dialog } = remote;
import * as React from 'react';
import * as ReactDom from 'react-dom';
import Space, { Size as SpaceSize } from '../lsg/patterns/space';
import SplashScreen from '../lsg/patterns/splash-screen';
import { Store } from '../store/store';

// prevent app zooming
webFrame.setVisualZoomLevelLimits(1, 1);
webFrame.setLayoutZoomLevelLimits(0, 0);

globalStyles();

interface AppProps {
	store: Store;
}

@observer
class App extends React.Component<AppProps> {
	private static PatternListID = 'patternlist';
	private static PropertiesListID = 'propertieslist';

	@MobX.observable protected activeTab: string = App.PatternListID;
	@MobX.observable protected projectListVisible: boolean = false;
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
		this.handleChromeToggle = this.handleChromeToggle.bind(this);
		this.handleCreateNewSpaceClick = this.handleCreateNewSpaceClick.bind(this);
		this.handleOpenSpaceClick = this.handleOpenSpaceClick.bind(this);
	}

	private handleMainWindowClick(): void {
		this.props.store.setElementFocussed(false);
		createMenu(this.props.store);
	}

	public render(): JSX.Element {
		// Todo: project and page don't update on page change
		const project = this.props.store.getCurrentProject();
		const title = `${project && project.getName()}`;
		const previewFrame = project && project.getPreviewFrame();
		const previewFramePath =
			previewFrame && PathUtils.join(this.props.store.getStyleGuidePath(), 'alva', previewFrame);

		const DevTools = getDevTools();

		return (
			<Layout directionVertical handleClick={this.handleMainWindowClick}>
				<Chrome
					title={title}
					handleClick={this.handleChromeToggle}
					open={this.projectListVisible}
				>
					{project && <ProjectList store={this.props.store} open={this.projectListVisible} />}
				</Chrome>
				<MainArea>
					{project && [
						<SideBar key="left" directionVertical hasPaddings>
							<ElementPane>
								<Space sizeBottom={SpaceSize.L}>
									<PageList store={this.props.store} />
								</Space>
								<ElementList store={this.props.store} />
							</ElementPane>
							<PatternsPane>
								<PatternListContainer store={this.props.store} />
							</PatternsPane>
						</SideBar>,
						<PreviewPane key="center" previewFrame={previewFramePath} />,
						<SideBar key="right" directionVertical hasPaddings>
							<PropertyPane>
								<PropertyList store={this.props.store} />
							</PropertyPane>
						</SideBar>
					]}
					{!project && (
						<SplashScreen>
							<Space sizeBottom={SpaceSize.L}>
								<Headline textColor={colors.grey20} order={2}>
									Getting started with Alva
								</Headline>
							</Space>
							<Space sizeBottom={SpaceSize.XXXL}>
								<Copy size={CopySize.M} textColor={colors.grey20}>
									You can open an existing Alva space or create a new one based on our
									designkit including some basic components to kickstart your project.
								</Copy>
							</Space>
							<Space sizeBottom={SpaceSize.S}>
								<Button handleClick={this.handleCreateNewSpaceClick} order={Order.Primary}>
									Create new Alva space
								</Button>
							</Space>
							<Link color={colors.grey50} onClick={this.handleOpenSpaceClick}>
								<Copy size={CopySize.S}>or open existing Alva space</Copy>
							</Link>
						</SplashScreen>
					)}
				</MainArea>
				<IconRegistry names={IconName} />
				{DevTools ? <DevTools /> : null}
			</Layout>
		);
	}

	@MobX.action
	protected handleTabNaviagtionClick(evt: React.MouseEvent<HTMLElement>, id: string): void {
		this.activeTab = id;
	}

	@MobX.action
	protected handleChromeToggle(evt: React.MouseEvent<HTMLElement>): void {
		this.projectListVisible = !this.projectListVisible;
	}

	protected handleCreateNewSpaceClick(): void {
		let appPath: string = app.getAppPath().replace('.asar', '.asar.unpacked');
		if (appPath.indexOf('node_modules') >= 0) {
			appPath = ProcessUtils.cwd();
		}

		const designkitPath = PathUtils.join(appPath, 'build', 'designkit');
		console.log(`Design kit path is: ${designkitPath}`);
		dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, filePaths => {
			if (filePaths.length <= 0) {
				return;
			}

			FileExtraUtils.copySync(designkitPath, PathUtils.join(filePaths[0], 'designkit'));
			this.props.store.openStyleguide(`${filePaths[0]}/designkit`);
			this.props.store.openFirstPage();
		});
	}

	protected handleOpenSpaceClick(): void {
		dialog.showOpenDialog({ properties: ['openDirectory'] }, filePaths => {
			this.props.store.openStyleguide(filePaths[0]);
			this.props.store.openFirstPage();
		});
	}
}

function getDevTools(): React.StatelessComponent | null {
	try {
		const DevToolsExports = require('mobx-react-devtools');
		return DevToolsExports ? DevToolsExports.default : undefined;
	} catch (error) {
		return null;
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
