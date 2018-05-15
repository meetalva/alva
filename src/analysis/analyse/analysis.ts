import * as AnalyseTypes from '../types';

// tslint:disable-next-line:no-any
type AnalysisData = Map<string, any[]>;

// This backend my be something IO-related in the future
const SCOPE = new WeakMap<Analysis, AnalysisData>();

export class Analysis implements AnalyseTypes.Analysis {
	private constructor() {
		SCOPE.set(this, new Map());
	}

	public static create(): Analysis {
		return new Analysis();
	}

	// tslint:disable-next-line:no-any
	public async attach(path: string, data: any): Promise<void> {
		const scope = SCOPE.get(this) as AnalysisData;

		if (scope.has(path)) {
			// tslint:disable-next-line:no-any
			const previous = scope.get(path) as any[];
			previous.push(data);
		} else {
			scope.set(path, [data]);
		}
	}

	// tslint:disable-next-line:no-any
	public async get(path: string): Promise<any> {
		const scope = SCOPE.get(this) as AnalysisData;
		return scope.get(path);
	}
}
