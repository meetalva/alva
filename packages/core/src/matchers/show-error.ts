import * as M from '../message';
import * as T from '../types';
import * as uuid from 'uuid';
import * as AlvaUtil from '../alva-util';

export function showError({ host }: T.MatcherContext): T.Matcher<M.ShowError> {
	return async m => {
		const userReport: M.UserReport = m.payload.error
			? {
					type: M.MessageType.UserReport,
					id: uuid.v4(),
					payload: m.payload.error
			  }
			: undefined;

		const buttons: (T.HostMessageButton | undefined)[] = [
			m.payload.help
				? {
						label: 'Learn more',
						message: () => ({
							type: M.MessageType.OpenExternalURL,
							id: uuid.v4(),
							payload: m.payload.help
						})
				  }
				: undefined,
			{
				label: 'OK',
				message: ({ checked }) => (checked && userReport ? userReport : undefined)
			},
			{
				label: 'Cancel'
			},
			{
				label: 'Report on GitHub',
				message: () => ({
					id: uuid.v4(),
					type: M.MessageType.OpenExternalURL,
					payload: AlvaUtil.newIssueUrl({
						user: 'meetalva',
						repo: 'alva',
						title: 'New bug report',
						body: m.payload.error
							? `Hey there, I just encountered the following error with Alva:\n\n\`\`\`\n${
									m.payload.error.message
							  }\n\`\`\`\n\n<details><summary>Stack Trace</summary>\n\n\`\`\`\n${
									m.payload.error.stack
							  }\n\`\`\`\n\n</details>`
							: '',
						labels: ['type: bug']
					})
				})
			}
		];

		await host.showMessage({
			type: 'warning',
			message: [m.payload.error ? 'Send error report:' : '', m.payload.message]
				.filter(Boolean)
				.join(' '),
			detail: [
				m.payload.detail,
				...(m.payload.error
					? [
							'',
							'',
							'Send us anonymized data to help making Alva better.',
							'Reach us directly by filing a GitHub issue.'
					  ]
					: [])
			].join('\n'),
			checkbox: m.payload.error
				? { label: 'Send anonymous error report to Alva', checked: true }
				: undefined,
			buttons: buttons.filter((b): b is T.HostMessageButton => typeof b !== 'undefined')
		});
	};
}
