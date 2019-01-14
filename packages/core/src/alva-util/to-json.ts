import * as Types from '@meetalva/types';

export function toJSON(input: unknown): string {
	return JSON.stringify(input, (_, value) => {
		if (value instanceof Set) {
			return { type: Types.SerialializationType.Set, data: Array.from(value) };
		}

		return value;
	});
}
