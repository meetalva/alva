import * as M from '../message';
import * as T from '../types';
import * as uuid from 'uuid';

const timeago = require('timeago.js');

export function showUpdateDetails({ host }: T.MatcherContext): T.Matcher<M.ShowUpdateDetails> {
	return async m => {
		await host.showMessage({
			message: `Restart to update`,
			detail: [
				`The new Alva version ${m.payload.version} is ready to install.`,
				`${m.payload.version} has been published ${timeago.format(m.payload.releaseDate)}.`,
				'\n',
				`Alva needs to restart to install this update.`
			].join('\n'),
			buttons: [
				{
					label: 'Restart & Install',
					selected: true,
					message: {
						id: uuid.v4(),
						type: M.MessageType.InstallUpdate,
						payload: undefined
					}
				},
				{
					label: 'Later',
					cancel: true
				}
			]
		});
	};
}
