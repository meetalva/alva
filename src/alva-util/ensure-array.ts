// tslint:disable-next-line:no-any
export function ensureArray(input: any): any[] {
	return (Array.isArray(input) ? input : [input]).filter(Boolean);
}
