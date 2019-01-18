import * as uuid from 'uuid';
import { ElectronAdapter } from './electron-adapter';
import { AlvaServer } from '../../server';
import * as M from '../../message';
import * as Matchers from '../../matchers';

jest.mock('mobx');
jest.mock('@sentry/electron');
jest.mock('./electron-updater');

jest.mock('../../matchers', () => {
	const MockMatchers = jest.genMockFromModule('../../matchers') as any;
	const openAssetHandler = jest.fn();
	const updatePatternLibraryHandler = jest.fn();

	MockMatchers.openAsset = () => openAssetHandler;
	MockMatchers.openAsset.handler = openAssetHandler;
	MockMatchers.updatePatternLibrary = () => updatePatternLibraryHandler;
	MockMatchers.updatePatternLibrary.handler = updatePatternLibraryHandler;

	return MockMatchers;
});

jest.mock('../../server', () => {
	const URL = require('url');
	const { Sender } = require('../../sender');
	const { ElectronHost: MockHost } = jest.genMockFromModule('../../hosts/electron-host');
	const { AlvaServer: MockAlvaServer } = jest.genMockFromModule('../../server');

	return {
		AlvaServer: class MockServer extends MockAlvaServer {
			public sender = new Sender({});
			public host = new MockHost();
			public location = new URL.URL('https://some-domain.com');

			public static fromHosts(): AlvaServer {
				return (new MockServer() as any) as AlvaServer;
			}
		}
	};
});

jest.mock('electron', () => {
	return {
		app: {
			on: jest.fn()
		},
		Menu: {
			buildFromTemplate: jest.fn(),
			setApplicationMenu: jest.fn()
		}
	};
});

test('reacts to asset read requests', async () => {
	const server = await AlvaServer.fromHosts({} as any);

	const adapter = new ElectronAdapter({ server, forceUpdates: false });
	await adapter.start();

	const inMessage: M.Message = {
		type: M.MessageType.AssetReadRequest,
		id: uuid.v4(),
		payload: undefined
	};

	server.sender.send(inMessage);
	expect((Matchers.openAsset as any).handler).toHaveBeenCalledWith(inMessage);
});

test('reacts to pattern library update request', async () => {
	const server = await AlvaServer.fromHosts({} as any);
	const adapter = new ElectronAdapter({ server, forceUpdates: false });
	await adapter.start();

	const reqMsg: M.Message = {
		type: M.MessageType.UpdatePatternLibraryRequest,
		id: uuid.v4(),
		payload: {
			libId: uuid.v4(),
			projectId: uuid.v4()
		}
	};
	server.sender.send(reqMsg);
	expect((Matchers.updatePatternLibrary as any).handler).toHaveBeenCalledWith(reqMsg);
});

test('creates new splashscreen on start', async () => {
	const server = await AlvaServer.fromHosts({} as any);

	const adapter = new ElectronAdapter({ server, forceUpdates: false });
	await adapter.start();

	expect((server as any).host.createWindow).toHaveBeenCalled();
});

test('create no splashscreen on start with filePath', async () => {
	const server = await AlvaServer.fromHosts({} as any);

	const adapter = new ElectronAdapter({ server, forceUpdates: false });
	await adapter.start({ filePath: 'some-file' });

	expect((server as any).host.createWindow).not.toHaveBeenCalled();
});
