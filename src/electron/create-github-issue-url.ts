import * as Electron from 'electron';

const URLSearchParams = require('url-search-params');

export function createGithubIssueUrl(error: Error): string {
	const params = new URLSearchParams();
	params.set('title', 'New bug report');
	params.set(
		'body',
		`Hey there, I just encountered the following error with Alva ${Electron.app.getVersion()}:\n\n\`\`\`\n${
			error.message
		}\n\`\`\`\n\n<details><summary>Stack Trace</summary>\n\n\`\`\`\n${
			error.stack
		}\n\`\`\`\n\n</details>`
	);
	params.append('labels', 'type: bug');

	return `https://github.com/meetalva/alva/issues/new?${params}`;
}
