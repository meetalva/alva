export function patternIdToWebpackName(id: string): string {
	return encodeURIComponent(
		id
			.split('@')[0]
			.split('/')
			.join('-')
	);
}
