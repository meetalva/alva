export interface IdPair {
	input: {
		contextId: string;
	};
	output: string;
}

export interface NestedIdPair {
	input: {
		parentId: string;
		contextId: string;
	};
	output: string;
}

export interface ContextIdMap {
	enumOptions: NestedIdPair[];
	patterns: IdPair[];
	properties: NestedIdPair[];
	slots: NestedIdPair[];
}
