export function guessName(id: string): string {
	const guessedName = id
		.replace(/[_-]+/, ' ')
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.toLowerCase();

	return guessedName.substring(0, 1).toUpperCase() + guessedName.substring(1);
}
