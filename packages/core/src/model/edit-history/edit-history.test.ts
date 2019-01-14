import * as Types from '../../types';
import { EditHistory } from './edit-history';

test('starts with empty history', () => {
	const history = new EditHistory();
	expect(history.length).toBe(0);
});

test('.record leaves history unchanged', () => {
	const history = new EditHistory();

	history.record({
		projectId: 'project-id',
		path: '/',
		change: {
			type: Types.MobxChangeType.Update,
			object: { a: false },
			name: 'a',
			newValue: true,
			oldValue: false
		}
	});

	expect(history.length).toBe(0);
});

test('.commit ignores empty changesets', () => {
	const history = new EditHistory();
	history.commit();

	expect(history.length).toBe(0);
});

test('.commit packs records into changesets', () => {
	const history = new EditHistory();

	history.record({
		projectId: 'project-id',
		path: '/',
		change: {
			type: Types.MobxChangeType.Update,
			object: { a: false },
			name: 'a',
			newValue: true,
			oldValue: false
		}
	});

	history.record({
		projectId: 'project-id',
		path: '/',
		change: {
			type: Types.MobxChangeType.Update,
			object: { a: false },
			name: 'b',
			newValue: true,
			oldValue: false
		}
	});

	history.commit();

	expect(history.length).toBe(1);
	expect(history.peek()).toEqual(
		expect.objectContaining({
			changes: [
				expect.objectContaining({ change: expect.objectContaining({ name: 'a' }) }),
				expect.objectContaining({ change: expect.objectContaining({ name: 'b' }) })
			]
		})
	);
});
