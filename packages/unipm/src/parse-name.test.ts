import { parseName } from './parse-name';

test('parses as expected', () => {
	const result = parseName('unipm');

	expect(result).toEqual(
		expect.objectContaining({
			full: 'unipm',
			name: 'unipm',
			scope: '',
			versionRange: 'latest'
		})
	);
});

test('parses version range as expected', () => {
	const result = parseName('unipm@1.0.0');

	expect(result).toEqual(
		expect.objectContaining({
			full: 'unipm',
			name: 'unipm',
			scope: '',
			versionRange: '1.0.0'
		})
	);
});

test('parses version range as expected', () => {
	const result = parseName('@scope/name@version');

	expect(result).toEqual(
		expect.objectContaining({
			full: '@scope/name',
			name: 'name',
			scope: '@scope',
			versionRange: 'version'
		})
	);
});
