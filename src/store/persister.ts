import * as Fs from 'fs';
import * as Yaml from 'js-yaml';

export interface Persistable<T> {
	// tslint:disable-next-line:no-any
	is(thing: any): T;
	toJSON(): string;
}

export enum PersistenceState {
	Error = 'error',
	Success = 'success'
}

export type PersistencePersistResult = PersistencePersistError | PersistencePersistSuccess;

export interface PersistencePersistError {
	error: Error;
	state: PersistenceState.Error;
}

export interface PersistencePersistSuccess {
	state: PersistenceState.Success;
}

export type PersistenceReadResult<T> = PersistenceReadError | PersistenceReadSuccess<T>;

export interface PersistenceReadError {
	error: Error;
	state: PersistenceState.Error;
}

export interface PersistenceReadSuccess<T> {
	contents: T;
	state: PersistenceState.Success;
}

export class Persistence {
	// tslint:disable-next-line:no-any
	public static persist(path: string, model: any): Promise<PersistencePersistResult> {
		return new Promise((resolve, reject) => {
			const data = model.toJSON();
			Fs.writeFile(path, Yaml.safeDump(data, { skipInvalid: true, noRefs: true }), error => {
				if (error) {
					return resolve({
						state: PersistenceState.Error,
						error
					});
				}
				resolve({
					state: PersistenceState.Success
				});
			});
		});
	}

	public static read<T>(path: string): Promise<PersistenceReadResult<T>> {
		return new Promise(resolve => {
			Fs.readFile(path, (error, contents) => {
				if (error) {
					return resolve({
						state: PersistenceState.Error,
						error
					});
				}
				resolve({
					state: PersistenceState.Success,
					contents: Yaml.load(String(contents)) as T
				});
			});
		});
	}
}
