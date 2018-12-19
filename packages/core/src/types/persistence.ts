export interface Persistable<T> {
	// tslint:disable-next-line:no-any
	is(thing: any): T;
	toJSON(): string;
}

export enum PersistenceState {
	Error = 'error',
	Success = 'success'
}

export type PersistenceSerializeResult = PersistencePersistError | PersistencePersistSuccess;

export interface PersistencePersistError {
	error: Error;
	state: PersistenceState.Error;
}

export interface PersistencePersistSuccess {
	contents: string;
	state: PersistenceState.Success;
}

export type PersistenceParseResult<T> = PersistenceReadError | PersistenceReadSuccess<T>;

export interface PersistenceReadError {
	error: Error;
	state: PersistenceState.Error;
}

export interface PersistenceReadSuccess<T> {
	contents: T;
	state: PersistenceState.Success;
}
