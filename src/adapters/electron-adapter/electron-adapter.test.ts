import * as uuid from 'uuid';
import { ElectronAdapter } from './electron-adapter';
import { AlvaServer } from '../../server';
import * as M from '../../message';
import * as Matchers from '../../matchers';

jest.mock('mobx');
jest.mock('./electron-updater');

jest.mock('../../matchers', () => {
	const MockMatchers = jest.genMockFromModule('../../matchers') as any;
	const openAssetHandler = jest.fn();

	MockMatchers.openAsset = () => openAssetHandler;
	MockMatchers.openAsset.handler = openAssetHandler;

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

	const adapter = new ElectronAdapter({ server });
	await adapter.start();

	const inMessage: M.Message = {
		type: M.MessageType.AssetReadRequest,
		id: uuid.v4(),
		payload: undefined
	};

	server.sender.send(inMessage);
	expect((Matchers.openAsset as any).handler).toHaveBeenCalledWith(inMessage);
});
