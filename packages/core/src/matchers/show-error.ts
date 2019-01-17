import * as M from '../message';
import * as T from '../types';
import * as uuid from 'uuid';
import * as AlvaUtil from '../alva-util';

export function showError({ host }: T.MatcherContext): T.Matcher<M.ShowError> {
	return async m => {
		const userReportMessage: M.UserReport = {
			type: M.MessageType.UserReport,
			id: uuid.v4(),
			payload: m.payload.error
		};

		const buttons: (T.HostMessageButton | undefined)[] = [
			{
				label: 'OK',
				message({ checked }) {
					if (!checked) {
						return [];
					}

					return [userReportMessage];
				}
			},
			m.payload.help
				? {
						label: 'Learn more',
						message: {
							type: M.MessageType.OpenExternalURL,
							id: uuid.v4(),
							payload: m.payload.help
						}
				  }
				: undefined,
			{
				label: 'Report on GitHub',
				message({ checked }) {
					return [
						...(checked ? [userReportMessage] : []),
						{
							type: M.MessageType.OpenExternalURL,
							id: uuid.v4(),
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
						}
					];
				}
			}
		];

		await host.showMessage({
			type: 'warning',
			message: m.payload.message,
			detail: m.payload.detail,
			checkboxLabel:
				typeof m.payload.error !== 'undefined' ? `Send anonymous error report` : undefined,
			checkboxChecked: typeof m.payload.error !== 'undefined',
			buttons: buttons.filter((b): b is T.HostMessageButton => typeof b !== 'undefined')
		});
	};
}
