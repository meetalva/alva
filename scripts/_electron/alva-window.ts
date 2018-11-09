import * as Electron from 'electron';
import * as ConvertColor from 'color';
import * as Components from '../components';
import * as Model from '../model';

export interface AlvaWindowInit {
	id: string;
	port: number;
	projectId?: string;
	options?: Electron.BrowserWindowConstructorOptions;
}

export class AlvaWindow {
	public readonly id: string;
	public readonly port: number;
	public readonly app?: Model.AlvaApp;
	public readonly projectId?: string;

	public windows: Set<Electron.BrowserWindow> = new Set();

	public get target(): string {
		const base = `http://localhost:${this.port}`;
		return this.projectId ? `${base}/project/${this.projectId}` : base;
	}

	public constructor(init: AlvaWindowInit) {
		this.port = init.port;
		this.id = init.id;
		this.projectId = init.projectId;

		const window = new Electron.BrowserWindow({
			minWidth: 780,
			minHeight: 380,
			titleBarStyle: 'hiddenInset',
			backgroundColor: ConvertColor(Components.Color.Grey97)
				.hex()
				.toString(),
			title: 'Alva',
			webPreferences: {
				nodeIntegration: false,
				preload: require.resolve('./preload')
			},
			...init.options
		});

		this.windows.add(window);

		window.maximize();
		window.loadURL(this.target);

		window.once('closed', () => this.windows.delete(window));

		// Disable navigation on the host window object, triggered by system drag and drop
		window.webContents.on('will-navigate', e => e.preventDefault());
		window.webContents.on('new-window', e => e.preventDefault());
	}

	public async instrument(): Promise<void> {
		require('devtron').install();

		const {
			REACT_DEVELOPER_TOOLS,
			REACT_PERF,
			MOBX_DEVTOOLS
		} = require('electron-devtools-installer');
		const installDevTool = require('electron-devtools-installer').default;

		installDevTool(REACT_DEVELOPER_TOOLS);
		installDevTool(REACT_PERF);
		installDevTool(MOBX_DEVTOOLS);
	}
}
