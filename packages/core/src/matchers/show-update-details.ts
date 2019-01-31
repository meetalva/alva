import * as M from '@meetalva/message';
import * as uuid from 'uuid';
import { MatcherCreator } from './context';

const timeago = require('timeago.js');

export const showUpdateDetails: MatcherCreator<M.ShowUpdateDetails> = ({ host }) => {
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
};
