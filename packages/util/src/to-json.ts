export enum SerialializationType {
	Set = 'set'
}

export function toJSON(input: unknown): string {
	return JSON.stringify(input, (_, value) => {
		if (value instanceof Set) {
			return { type: SerialializationType.Set, data: Array.from(value) };
		}

		return value;
	});
}
