import * as Crypto from 'crypto';

export function getGlobalPatternId(contextId: string): string {
	return getId(contextId);
}

export function getGlobalPropertyId(patternId: string, contextId: string): string {
	return getNestedId(patternId, contextId);
}

export function getGlobalEnumOptionId(enumId: string, contextId: string): string {
	return getNestedId(enumId, contextId);
}

export function getGlobalSlotId(patternId: string, contextId: string): string {
	return getNestedId(patternId, contextId);
}

function getId(contextId: string): string {
	const hash = Crypto.createHash('sha1');
	hash.update(contextId);
	return hash.digest('hex');
}

function getNestedId(parentId: string, contextId: string): string {
	const hash = Crypto.createHash('sha1');
	hash.update([parentId, contextId].join(':'));
	return hash.digest('hex');
}
