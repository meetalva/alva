import { Analysis } from './analysis';
import * as uuid from 'uuid';

test('attaches arbitray data to path', async () => {
	const analysis = Analysis.create();
	const id = uuid.v4();

	await analysis.attach('/', id);
	expect(await analysis.get('/')).toEqual(expect.arrayContaining([id]));
});

test('preserves all data on same path', async () => {
	const analysis = Analysis.create();
	const first = uuid.v4();
	const second = uuid.v4();

	await analysis.attach('/', first);
	await analysis.attach('/', second);

	expect(await analysis.get('/')).toEqual([first, second]);
});
