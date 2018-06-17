export type ParseResult<T> = ParseSuccess<T> | ParseError;

export interface ParseSuccess<T> {
	type: ParseResultType.Success;
	data: string;
	result: T;
}

export interface ParseError {
	type: ParseResultType.Error;
	data: string;
	error: Error;
}

export enum ParseResultType {
	Error,
	Success
}

export function parseJSON<T>(data: string): ParseResult<T> {
	try {
		return {
			type: ParseResultType.Success,
			data,
			result: JSON.parse(data)
		};
	} catch (error) {
		return {
			type: ParseResultType.Error,
			data,
			error
		};
	}
}
