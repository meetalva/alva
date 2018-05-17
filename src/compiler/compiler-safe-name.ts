export function compilerSafeName(id: string): string {
	return encodeURIComponent(
		id
			.split('@')[0]
			.split('/')
			.join('-')
	);
}
