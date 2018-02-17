const { execSync } = require('child_process');

execSync(`
	mkdir upload-for-github-release &&
	cp Alva-* alva_* latest* github/* upload-for-github-release/ &&
	rm upload-for-github-release/Alva-*.blockmap
`, {
		cwd: 'dist'
	}
);
