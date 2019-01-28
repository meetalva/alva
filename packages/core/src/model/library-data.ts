interface MinimalData {
	name: string;
	version: string;
}

interface Data extends MinimalData {
	[key: string]: unknown;
}

export class LibraryData {
	private data: Data;

	private constructor(data: Data) {
		this.data = data;
	}

	public static fromPackageJson(input: unknown): LibraryData {
		if (typeof input !== 'object') {
			throw new Error(`Received type ${typeof input} as LibraryData input`);
		}

		if (input === null) {
			throw new Error(`Received null as LibraryData input`);
		}

		if (['input', 'name'].some(key => !input.hasOwnProperty(key))) {
			throw new Error(`input, name are required in LibraryData input`);
		}

		return new LibraryData(input as Data);
	}
}
