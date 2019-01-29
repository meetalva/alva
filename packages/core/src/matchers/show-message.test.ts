import { AlvaApp } from '@meetalva/model';
import * as M from '@meetalva/message';
import * as T from '@meetalva/types';
import { showMessage } from './show-message';
import { ElectronHost } from '../hosts/electron-host';
import { Sender } from '../sender';
import { LocalDataHost } from '../hosts/local-data-host';
import * as uuid from 'uuid';

jest.mock('../sender');
jest.mock('../model/alva-app', () => {
	class MockAlvaApp {
		public static fromSender(_: unknown) {
			return new MockAlvaApp();
		}

		public getId() {
			return 'mock-app';
		}
	}

	return { AlvaApp: MockAlvaApp };
});

jest.mock('../hosts/electron-host', () => {
	class MockElectronHost {
		public type = T.HostType.Electron;
		private sender: Sender;

		private constructor() {
			this.sender = new Sender({} as any);
		}

		public static from(_: unknown) {
			return new MockElectronHost();
		}

		// tslint:disable-next-line:no-empty
		public log() {}

		public async getSender(): Promise<Sender> {
			return this.sender;
		}

		public async showMessage(): Promise<T.HostMessageButton<unknown> | undefined> {
			return;
		}
	}

	return { ElectronHost: MockElectronHost };
});
jest.mock('../hosts/local-data-host');

test('calls host.showMessage without app on ElectronHost', async () => {
	const host = (await ElectronHost.from({ process })) as any;
	const dataHost = await LocalDataHost.fromHost(host);
	const sender = await host.getSender();

	const app = AlvaApp.fromSender(sender);
	host.getApp = async (id: string) => (id === app.getId() ? app : undefined);
	host.showMessage = jest.fn(() => null);

	const fn = showMessage({ host, dataHost, location: {} as any });

	await fn({
		id: uuid.v4(),
		appId: app.getId(),
		type: M.MessageType.ShowMessage,
		payload: {
			message: '',
			buttons: []
		}
	});

	expect(host.showMessage).toHaveBeenCalledTimes(1);
});

test('calls host.showMessage without app on ElectronHost', async () => {
	const host = (await ElectronHost.from({ process })) as any;
	const dataHost = await LocalDataHost.fromHost(host);

	host.getApp = async () => undefined;
	host.showMessage = jest.fn(() => null);

	const fn = showMessage({ host, dataHost, location: {} as any });

	await fn({
		id: uuid.v4(),
		appId: undefined,
		type: M.MessageType.ShowMessage,
		payload: {
			message: '',
			buttons: []
		}
	});

	expect(host.showMessage).toHaveBeenCalledTimes(1);
});
