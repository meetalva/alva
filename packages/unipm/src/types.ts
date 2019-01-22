import * as Fs from 'fs';

export type Fs = typeof Fs;
export type Fetch = typeof fetch;

export interface Options {
	cwd: string;
	fs: Fs;
	fetch: Fetch;
}

export interface UserOptions {
	cwd?: string;
	fs?: Fs;
	fetch: Fetch;
}
