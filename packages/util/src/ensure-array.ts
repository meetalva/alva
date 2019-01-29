export function ensureArray(input: unknown): unknown[] {
	return (Array.isArray(input) ? input : [input]).filter(Boolean);
}
