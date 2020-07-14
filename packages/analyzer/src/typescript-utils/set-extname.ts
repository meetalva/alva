import * as fs from 'fs';
import * as Path from 'path';

export function setExtname(
	input: string,
	ext: string,
	pkg?: { [key: string]: string },
	cwd?: string
): string {
	const candidate = Path.basename(input, Path.extname(input));

	const basename =
		Path.extname(candidate) === '.d'
			? Path.basename(candidate, Path.extname(candidate))
			: candidate;

	let newPath = Path.join(Path.dirname(input), `${basename}${ext}`);
	if (!fs.existsSync(newPath) && pkg && cwd) {
		const packageMainPath = `${cwd}${pkg.main.replace('./', '\\')}`;
		if (fs.existsSync(packageMainPath)) {
			newPath = packageMainPath;
		}
	}

	return newPath;
}
