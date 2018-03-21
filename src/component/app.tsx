import Button, { Order } from '../lsg/patterns/button';
import { Chrome } from './container/chrome';
import { colors } from '../lsg/patterns/colors';
import Copy, { Size as CopySize } from '../lsg/patterns/copy';
import { ipcRenderer, remote, webFrame, WebviewTag } from 'electron';
import { ElementList } from './container/element-list';
import ElementPane from '../lsg/patterns/panes/element-pane';
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
import { PageList } from './container/page-list';
import * as PathUtils from 'path';
import { PatternListContainer } from './container/pattern-list';
import PatternsPane from '../lsg/patterns/panes/patterns-pane';
import { PreviewPaneWrapper } from '../component/container/preview-pane-wrapper';
import * as ProcessUtils from 'process';
import { ProjectList } from './container/project-list';
import { PropertyList } from './container/property-list';
import PropertyPane from '../lsg/patterns/panes/property-pane';
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

const store: Store = Store.getInstance();
store.openFromPreferences();

@observer
class App extends React.Component<{}> {
	private static PATTERN_LIST_ID = 'patternlist';
	private static PROPERTIES_LIST_ID = 'propertieslist';

	@MobX.observable protected activeTab: string = App.PATTERN_LIST_ID;
	private ctrlDown: boolean = false;
	@MobX.observable protected projectListVisible: boolean = false;
	private shiftDown: boolean = false;

	public constructor(props: {}) {
		super(props);
		this.handleTabNaviagtionClick = this.handleTabNaviagtionClick.bind(this);
		this.handleMainWindowClick = this.handleMainWindowClick.bind(this);
		this.handleChromeToggle = this.handleChromeToggle.bind(this);
		this.handleCreateNewSpaceClick = this.handleCreateNewSpaceClick.bind(this);
		this.handleOpenSpaceClick = this.handleOpenSpaceClick.bind(this);
	}

	public componentDidMount(): void {
		createMenu();
		this.redirectUndoRedo();
	}

	private getDevTools(): React.StatelessComponent | null {
		try {
			const DevToolsExports = require('mobx-react-devtools');
			return DevToolsExports ? DevToolsExports.default : undefined;
		} catch (error) {
			return null;
		}
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
		dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, filePaths => {
			if (filePaths.length <= 0) {
				return;
			}

			FileExtraUtils.copySync(designkitPath, PathUtils.join(filePaths[0], 'designkit'));
			store.openStyleguide(`${filePaths[0]}/designkit`);
			store.openFirstPage();
		});
	}

	private handleMainWindowClick(): void {
		Store.getInstance().setElementFocussed(false);
		createMenu();
	}

	protected handleOpenSpaceClick(): void {
		dialog.showOpenDialog({ properties: ['openDirectory'] }, filePaths => {
			store.openStyleguide(filePaths[0]);
			store.openFirstPage();
		});
	}

	@MobX.action
	protected handleTabNaviagtionClick(evt: React.MouseEvent<HTMLElement>, id: string): void {
		this.activeTab = id;
	}

	@MobX.computed
	protected get isPatternListVisible(): boolean {
		return Boolean(this.activeTab === App.PATTERN_LIST_ID);
	}

	@MobX.computed
	protected get isPropertiesListVisible(): boolean {
		return Boolean(this.activeTab === App.PROPERTIES_LIST_ID);
	}

	private redirectUndoRedo(): void {
		document.body.onkeydown = event => {
			if (event.keyCode === 16) {
				this.shiftDown = true;
			} else if (event.keyCode === 17 || event.keyCode === 91) {
				this.ctrlDown = true;
			} else if (this.ctrlDown && event.keyCode === 90) {
				event.preventDefault();
				if (this.shiftDown) {
					Store.getInstance().redo();
				} else {
					Store.getInstance().undo();
				}

				return false;
			}

			return true;
		};

		document.body.onkeyup = event => {
			if (event.keyCode === 16) {
				this.shiftDown = false;
			} else if (event.keyCode === 17 || event.keyCode === 91) {
				this.ctrlDown = false;
			}
		};
	}

	public render(): JSX.Element {
		// Todo: project and page don't update on page change
		const project = store.getCurrentProject();
		const title = `${project && project.getName()}`;
		const styleguide = store.getStyleguide();
		const previewFrame = project && project.getPreviewFrame();
		const previewFramePath =
			styleguide &&
			previewFrame &&
			PathUtils.join(styleguide.getPagesPath(), 'alva', previewFrame);

		const DevTools = this.getDevTools();

		return (
			<Layout directionVertical handleClick={this.handleMainWindowClick}>
				<Chrome
					title={title}
					handleClick={this.handleChromeToggle}
					open={this.projectListVisible}
				>
					{project && <ProjectList open={this.projectListVisible} />}
				</Chrome>
				<MainArea>
					{project && [
						<SideBar key="left" directionVertical hasPaddings>
							<ElementPane>
								<Space sizeBottom={SpaceSize.L}>
									<PageList />
								</Space>
								<ElementList />
							</ElementPane>
							<PatternsPane>
								<PatternListContainer />
							</PatternsPane>
						</SideBar>,
						<PreviewPaneWrapper key="center" previewFrame={previewFramePath} />,
						<SideBar key="right" directionVertical hasPaddings>
							<PropertyPane>
								<PropertyList />
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
}

ipcRenderer.on('preview-ready', (readyEvent: {}, readyMessage: JsonObject) => {
	function sendWebViewMessage(message: JsonObject, channel: string): void {
		const webviewTag: WebviewTag = document.getElementById('preview') as WebviewTag;
		if (webviewTag && webviewTag.send) {
			webviewTag.send(channel, message);
		}
	}

	global.setTimeout(() => {
		MobX.autorun(() => {
			const styleguide = store.getStyleguide();
			const message: JsonObject = {
				analyzerName: store.getAnalyzerName(),
				projects: store.getProjects().map(project => project.toJsonObject()),
				styleguidePath: styleguide ? styleguide.getPath() : undefined
			};
			sendWebViewMessage(message, 'styleguide-change');
		});

		MobX.autorun(() => {
			const page: Page | undefined = store.getCurrentPage();
			const message: JsonObject = {
				page: page ? page.toJsonObject() : undefined,
				pageId: page ? page.getId() : undefined
			};

			sendWebViewMessage(message, 'page-change');
		});

		MobX.autorun(() => {
			const selectedElement = store.getSelectedElement();
			const message: JsonObject = {
				selectedElementId: selectedElement ? selectedElement.getId() : undefined
			};
			sendWebViewMessage(message, 'selectedElement-change');
		});
	}, 3000);
});

ReactDom.render(<App />, document.getElementById('app'));

// Disable drag and drop from outside the application
document.addEventListener(
	'dragover',
	event => {
		event.preventDefault();
	},
	false
);
document.addEventListener(
	'drop',
	event => {
		event.preventDefault();
	},
	false
);
