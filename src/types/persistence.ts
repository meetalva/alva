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
