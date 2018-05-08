import AddButton from '../../lsg/patterns/add-button';
import { ChromeContainer } from '../chrome/chrome-container';
import { ipcRenderer } from 'electron';
import { ElementList } from '../../component/container/element-list';
import ElementPane from '../../lsg/patterns/panes/element-pane';
import globalStyles from '../../lsg/patterns/global-styles';
import { IconName, IconRegistry } from '../../lsg/patterns/icons';
import Layout, {
	LayoutBorder,
	LayoutDirection,
	LayoutSide,
	MainArea,
	SideBar
} from '../../lsg/patterns/layout';
import { createMenu } from '../../electron/menu';
import { ServerMessageType } from '../../message';
import { observer } from 'mobx-react';
import { PageListContainer } from '../page-list/page-list-container';
import { PageListPreview } from '../page-list/page-list-preview';
import { PatternListContainer } from './pattern-list';
import PatternsPane from '../../lsg/patterns/panes/patterns-pane';
import { PreviewPaneWrapper } from '../../component/container/preview-pane-wrapper';
import { PropertyList } from './property-list';
import PropertyPane from '../../lsg/patterns/panes/property-pane';
import * as React from 'react';
import { SplashScreen } from './splash-screen';
import { ViewStore } from '../../store';
import { AlvaView, RightPane } from '../../store/types';
import * as uuid from 'uuid';

globalStyles();

@observer
export class App extends React.Component {
	private ctrlDown: boolean = false;
	private shiftDown: boolean = false;

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

	private redirectUndoRedo(): void {
		document.body.onkeydown = event => {
			if (event.keyCode === 16) {
				this.shiftDown = true;
			} else if (event.keyCode === 17 || event.keyCode === 91) {
				this.ctrlDown = true;
			} else if (this.ctrlDown && event.keyCode === 90) {
				event.preventDefault();
				if (this.shiftDown) {
					ViewStore.getInstance().redo();
				} else {
					ViewStore.getInstance().undo();
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
		const store = ViewStore.getInstance();
		const DevTools = this.getDevTools();

		return (
			<Layout direction={LayoutDirection.Column}>
				<ChromeContainer />
				<MainArea>
					{store.getActiveView() === AlvaView.SplashScreen && (
						<SplashScreen
							onPrimaryButtonClick={() => {
								ipcRenderer.send('message', {
									type: ServerMessageType.CreateNewFileRequest,
									id: uuid.v4()
								});
							}}
							onSecondaryButtonClick={() => {
								ipcRenderer.send('message', {
									type: ServerMessageType.OpenFileRequest,
									id: uuid.v4()
								});
							}}
						/>
					)}
					{store.getActiveView() === AlvaView.Pages && (
						<PageListPreview>
							<PageListContainer />
						</PageListPreview>
					)}
					{store.getActiveView() === AlvaView.PageDetail && (
						<React.Fragment>
							<SideBar
								side={LayoutSide.Left}
								direction={LayoutDirection.Column}
								onClick={() => store.setSelectedElement()}
								border={LayoutBorder.Side}
							>
								<ElementPane>
									<ElementList />
								</ElementPane>
								<AddButton
									active={store.getRightPane() === RightPane.Patterns}
									label="Add Elements"
									onClick={e => {
										e.stopPropagation();
										store.setRightPane(RightPane.Patterns);
										store.setSelectedElement();
									}}
								/>
							</SideBar>
							<PreviewPaneWrapper
								key="center"
								id="preview"
								previewFrame={`http://localhost:${store.getServerPort()}/preview.html`}
							/>
							<SideBar
								side={LayoutSide.Right}
								direction={LayoutDirection.Column}
								border={LayoutBorder.Side}
							>
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
					)}
				</MainArea>
				<IconRegistry names={IconName} />
				{DevTools ? <DevTools /> : null}
			</Layout>
		);
	}
}
