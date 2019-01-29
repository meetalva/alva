import * as M from '../message';
import * as T from '@meetalva/types';
import * as uuid from 'uuid';
import * as AlvaUtil from '@meetalva/util';
import { MatcherCreator } from './context';

export const showError: MatcherCreator<M.ShowError> = ({ host }) => {
	return async m => {
		const buttons: (T.HostMessageButton<M.Message> | undefined)[] = [
			{
				label: 'OK'
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
				label: 'Report a Bug',
				message: {
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
			}
		];

		await host.showMessage({
			type: 'warning',
			message: m.payload.message,
			detail: m.payload.detail,
			buttons: buttons.filter(
				(b): b is T.HostMessageButton<M.Message> => typeof b !== 'undefined'
			)
		});
	};
};
