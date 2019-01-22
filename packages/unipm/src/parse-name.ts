export interface ParsedPackageName {
	full: string;
	name: string;
	scope: string;
	versionRange: string;
}

export function parseName(input: string): ParsedPackageName {
	if (input.charAt(0) === '/') {
		throw new Error(`Name should not start with "/", got "${input}"`);
	}

	if (input.charAt(0) === '.') {
		throw new Error(`Name should not start with ".", got "${input}"`);
	}

	const parts = input.split('/');
	const isScoped = input.charAt(0) === '@';

	if (isScoped && parts[0] === '@') {
		throw new Error(`Scope should not be empty, got "${input}"`);
	}

	const scope = isScoped ? parts[0] : '';
	const offset = isScoped ? 1 : 0;
	const rawName = parts[offset] || '';
	const nameParts = rawName.split('@');
	const name = nameParts[0];
	const versionRange = nameParts[1] || 'latest';
	const full = [scope, name].filter(Boolean).join('/');

	return { full, name, scope, versionRange };
}
