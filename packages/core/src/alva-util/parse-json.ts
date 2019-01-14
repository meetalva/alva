import * as Types from '@meetalva/types';

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
			result: JSON.parse(data, (key, value: unknown) => {
				if (typeof value !== 'object' || value === null) {
					return value;
				}

				const ob = value as object;

				if (!ob.hasOwnProperty('type') || !ob.hasOwnProperty('data')) {
					return value;
				}

				const candidate = ob as { type: unknown; data: unknown };

				if (typeof candidate.type !== 'string' || !Array.isArray(candidate.data)) {
					return value;
				}

				const refined = ob as { type: string; data: unknown[] };

				switch (refined.type) {
					case Types.SerialializationType.Set:
						return new Set(refined.data);
					default:
						return value;
				}
			})
		};
	} catch (error) {
		return {
			type: ParseResultType.Error,
			data,
			error
		};
	}
}
