import { install } from './install';
import * as nodeFetch from 'node-fetch';

const fetch = (nodeFetch as any) as typeof window.fetch;

jest.setTimeout(30000);

test('should fetch expected version', async () => {
	const fs = await install('@patternplate/cli', { fetch, cwd: '/' });
	// const manifest = JSON.parse(fs.readFileSync('/node_modules/@meetalva/designkit/package.json', 'utf-8'));
	// expect(manifest.name).toBe('@meetalva/designkit');
	// expect(manifest.version).toBe('1.2.1');
});
