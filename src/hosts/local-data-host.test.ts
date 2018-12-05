import * as uuid from 'uuid';
import { LocalDataHost } from './local-data-host';

test('add connection returns path and id', async () => {
	const dataHost = await LocalDataHost.fromHost({} as any);
	// $todo: add type for connection
	const connection = {
		id: uuid.v4(),
		path: 'path/to/my/file'
	};
	expect(dataHost.addConnection({} as any, {} as any, 'path/to/my/file')).toEqual(connection);
});
