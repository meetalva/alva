export interface NewGithubIssuePayload {
	body?: string;
	title?: string;
	labels?: string[];
	template?: string;
	milestone?: string;
	assignee?: string;
	projects?: string[];
}

export type NewGithubIssueOptions = NewGithubIssueOptionsShortHand | NewGithubIssueOptionsLongHand;

export interface NewGithubIssueOptionsShortHand extends NewGithubIssuePayload {
	repoUrl: string;
}

export interface NewGithubIssueOptionsLongHand extends NewGithubIssuePayload {
	user: string;
	repo: string;
}

const URLSearchParams = require('url-search-params');

export function newIssueUrl(options: any): string {
	let repoUrl;

	if (options.repoUrl) {
		repoUrl = options.repoUrl;
	} else if (options.user && options.repo) {
		repoUrl = `https://github.com/${options.user}/${options.repo}`;
	} else {
		throw new Error(
			'You need to specify either the `repoUrl` option or both the `user` and `repo` options'
		);
	}

	const types = ['body', 'title', 'labels', 'template', 'milestone', 'assignee', 'projects'];

	const params = types.reduce((ps, type) => {
		let value = options[type];

		if (value === undefined) {
			return ps;
		}

		if (type === 'labels' || type === 'projects') {
			if (!Array.isArray(value)) {
				throw new TypeError(`The \`${type}\` option should be an array`);
			}

			value = value.join(',');
		}

		ps.set(type, value);
		return ps;
	}, new URLSearchParams());

	return `${repoUrl}/issues/new?${params.toString()}`;
}
