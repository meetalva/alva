import Button, { Order } from '../../lsg/patterns/button';
import { ChromeContainer } from '../chrome/chrome-container';
import { colors } from '../../lsg/patterns/colors';
import Copy, { Size as CopySize } from '../../lsg/patterns/copy';
import { remote } from 'electron';
import { ElementList } from '../../component/container/element-list';
import ElementPane from '../../lsg/patterns/panes/element-pane';
import * as FileExtraUtils from 'fs-extra';
import globalStyles from '../../lsg/patterns/global-styles';
import { Headline } from '../../lsg/patterns/headline';
import { IconName, IconRegistry } from '../../lsg/patterns/icons';
import Layout, { MainArea, SideBar } from '../../lsg/patterns/layout';
import Link from '../../lsg/patterns/link';
import { createMenu } from '../../electron/menu';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageListContainer } from '../page-list/page-list-container';
import { PageListPreview } from '../page-list/page-list-preview';
import * as PathUtils from 'path';
import { PatternListContainer } from '../../component/container/pattern-list';
import PatternsPane from '../../lsg/patterns/panes/patterns-pane';
import { PreviewPaneWrapper } from '../../component/container/preview-pane-wrapper';
import * as ProcessUtils from 'process';
import { PropertyList } from './property-list';
import PropertyPane from '../../lsg/patterns/panes/property-pane';
import * as React from 'react';
import Space, { Size as SpaceSize } from '../../lsg/patterns/space';
import SplashScreen from '../../lsg/patterns/splash-screen';
import { Store } from '../../store/store';

globalStyles();

const store = Store.getInstance();

@observer
export class App extends React.Component {
	private static PATTERN_LIST_ID = 'patternlist';
	private static PROPERTIES_LIST_ID = 'propertieslist';
	@MobX.observable protected activeTab: string = App.PATTERN_LIST_ID;
	private ctrlDown: boolean = false;

	private shiftDown: boolean = false;

	public constructor(props: {}) {
		super(props);
		this.handleTabNaviagtionClick = this.handleTabNaviagtionClick.bind(this);
		this.handleMainWindowClick = this.handleMainWindowClick.bind(this);
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

	protected handleCreateNewSpaceClick(): void {
		let appPath: string = remote.app.getAppPath().replace('.asar', '.asar.unpacked');
		if (appPath.indexOf('node_modules') >= 0) {
			appPath = ProcessUtils.cwd();
		}

		const designkitPath = PathUtils.join(appPath, 'build', 'designkit');
		remote.dialog.showOpenDialog(
			{ properties: ['openDirectory', 'createDirectory'] },
			filePaths => {
				if (filePaths.length <= 0) {
					return;
				}

				FileExtraUtils.copySync(designkitPath, PathUtils.join(filePaths[0], 'designkit'));
				store.openStyleguide(`${filePaths[0]}/designkit`);
				store.openFirstPage();
			}
		);
	}

	private handleMainWindowClick(): void {
		Store.getInstance().setElementFocussed(false);
		createMenu();
	}

	protected handleOpenSpaceClick(): void {
		remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, filePaths => {
			store.openStyleguide(filePaths[0]);
			store.openFirstPage();
		});
	}

	protected handleTabNaviagtionClick(evt: React.MouseEvent<HTMLElement>, id: string): void {
		this.activeTab = id;
	}

	protected get isPatternListVisible(): boolean {
		return this.activeTab === App.PATTERN_LIST_ID;
	}

	protected get isPropertiesListVisible(): boolean {
		return this.activeTab === App.PROPERTIES_LIST_ID;
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
		const project = store.getCurrentProject();
		const styleguide = store.getStyleguide();
		const previewFrame = project && project.getPreviewFrame();
		const previewFramePath =
			styleguide && previewFrame && PathUtils.join(store.getPagesPath(), 'alva', previewFrame);

		const DevTools = this.getDevTools();

		return (
			<Layout directionVertical handleClick={this.handleMainWindowClick}>
				<ChromeContainer />
				<MainArea>
					{project &&
						!store.pageOverviewIsOpened && [
							<SideBar key="left" directionVertical hasPaddings>
								<ElementPane>
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
					{store.pageOverviewIsOpened && (
						<PageListPreview>
							<PageListContainer />
						</PageListPreview>
					)}
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
