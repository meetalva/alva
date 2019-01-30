import * as uuid from 'uuid';
import * as T from '@meetalva/types';

export class IdResolver {
	private map: T.ContextIdMap;

	constructor(map: T.ContextIdMap) {
		this.map = map;
	}

	private getId(contextId: string, haystack: T.IdPair[]): string {
		const match = haystack.find(p => p.input.contextId === contextId);
		return match ? match.output : uuid.v4();
	}

	private getNestedId(parentId: string, contextId: string, haystack: T.NestedIdPair[]): string {
		const match = haystack.find(
			p => p.input.parentId === parentId && p.input.contextId === contextId
		);
		return match ? match.output : uuid.v4();
	}

	public getGlobalPatternId(contextId: string): string {
		return this.getId(contextId, this.map.patterns);
	}

	public getGlobalPropertyId(patternId: string, contextId: string): string {
		return this.getNestedId(patternId, contextId, this.map.properties);
	}

	public getGlobalEnumOptionId(enumId: string, contextId: string): string {
		return this.getNestedId(enumId, contextId, this.map.enumOptions);
	}

	public getGlobalSlotId(patternId: string, contextId: string): string {
		return this.getNestedId(patternId, contextId, this.map.slots);
	}
}
