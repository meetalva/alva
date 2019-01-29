import * as Path from 'path';

export function setExtname(input: string, ext: string): string {
	const candidate = Path.basename(input, Path.extname(input));

	const basename =
		Path.extname(candidate) === '.d'
			? Path.basename(candidate, Path.extname(candidate))
			: candidate;

	return Path.join(Path.dirname(input), `${basename}${ext}`);
}
