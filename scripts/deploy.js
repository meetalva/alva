#!/usr/bin/env node
const ChildProcess = require('child_process');
const Path = require('path');
const base32 = require('base32');
const bot = require("circle-github-bot").create();

const SURGE_BIN = Path.resolve(process.cwd(), 'node_modules', '.bin', 'surge');

const args = process.argv.slice(2);
const folder = args[0];
const d = args[1];

if (!folder || !d) {
	console.log(`two arguments are required: [folder] [domain]`);
}

const fragments = d.split('.');
const suffix = fragments[fragments.length - 1];
const domain = fragments[fragments.length - 2];
const subdomain = fragments.slice(0, fragments.length - 2).join('.');

const safeDomain = `${base32.encode(subdomain)}.${domain}.${suffix}`;

ChildProcess.spawnSync(SURGE_BIN, [folder, safeDomain], {
	stdio: 'inherit'
});

bot.comment(`
Deployed at: <strong>${safeDomain}</strong>
`);
