#!/usr/bin/env node
import { performAnalysis } from '../matchers/perform-analysis';
import * as Path from 'path';

const yargsParser = require('yargs-parser');

async function main() {
	const flags = yargsParser(process.argv.slice(2));
	const [rawPath] = flags._;
	const path = Path.join(flags.cwd || process.cwd(), rawPath);

	await performAnalysis(path, { previousLibrary: undefined });
}

main().catch(err => {
	throw err;
});
