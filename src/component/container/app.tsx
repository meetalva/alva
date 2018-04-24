import { ChromeContainer } from '../chrome/chrome-container';
import { remote } from 'electron';
import { ElementButton } from './element-button';
import { ElementList } from '../../component/container/element-list';
import ElementPane from '../../lsg/patterns/panes/element-pane';
import * as FileExtraUtils from 'fs-extra';
import globalStyles from '../../lsg/patterns/global-styles';
import { IconName, IconRegistry } from '../../lsg/patterns/icons';
import Layout, { MainArea, SideBar } from '../../lsg/patterns/layout';
import { createMenu } from '../../electron/menu';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import * as PathUtils from 'path';
import { PatternListContainer } from './pattern-list';
import PatternsPane from '../../lsg/patterns/panes/patterns-pane';
import { PreviewPaneWrapper } from '../../component/container/preview-pane-wrapper';
import * as ProcessUtils from 'process';
import { PropertyList } from './property-list';
import PropertyPane from '../../lsg/patterns/panes/property-pane';
import * as React from 'react';
import { SplashScreen } from './splash-screen';
import { RightPane, Store } from '../../store/store';

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
	}

	public componentDidMount(): void {
		createMenu();
		this.redirectUndoRedo();
	}

	// TODO: Should move to store
	protected createNewSpace(): void {
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

	private getDevTools(): React.StatelessComponent | null {
		try {
			const DevToolsExports = require('mobx-react-devtools');
			return DevToolsExports ? DevToolsExports.default : undefined;
		} catch (error) {
			return null;
		}
	}

	private handleMainWindowClick(): void {
		Store.getInstance().setElementFocussed(false);
		createMenu();
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

	// TODO: Should move to store
	protected openSpace(): void {
		remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, filePaths => {
			store.openStyleguide(filePaths[0]);
			store.openFirstPage();
		});
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
			<Layout directionVertical onClick={this.handleMainWindowClick}>
				<ChromeContainer />
				<MainArea>
					{project ? (
						<React.Fragment>
							<SideBar
								key="left"
								directionVertical
								onClick={() => store.setSelectedElement()}
							>
								<ElementPane>
									<ElementList />
								</ElementPane>
								{store.getRightPane() === RightPane.Properties && (
									<ElementButton
										onClick={e => {
											e.stopPropagation();
											store.setRightPane(RightPane.Patterns);
										}}
									/>
								)}
							</SideBar>
							<PreviewPaneWrapper key="center" previewFrame={previewFramePath} />
							<SideBar key="right" directionVertical hasPaddings>
								{store.getRightPane() === RightPane.Properties && (
									<PropertyPane>
										<PropertyList />
									</PropertyPane>
								)}
								{store.getRightPane() === RightPane.Patterns && (
									<PatternsPane>
										<PatternListContainer />
									</PatternsPane>
								)}
							</SideBar>
						</React.Fragment>
					) : (
						<SplashScreen
							onPrimaryButtonClick={() => this.createNewSpace()}
							onSecondaryButtonClick={() => this.openSpace()}
						/>
					)}
				</MainArea>
				<IconRegistry names={IconName} />
				{DevTools ? <DevTools /> : null}
			</Layout>
		);
	}
}
