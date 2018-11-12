import * as Types from '../types';
import * as Message from '../message';
import * as uuid from 'uuid';

const ids = {
	help: uuid.v4(),
	gettingStarted: uuid.v4(),
	github: uuid.v4(),
	feedback: uuid.v4(),
	site: uuid.v4()
};

export const helpMenu = (ctx: Types.MenuContext): Types.MenuItem => ({
	id: ids.help,
	label: '&Help',
	role: 'help',
	submenu: [
		{
			id: ids.gettingStarted,
			label: '&Help and Getting Started',
			click: sender => {
				sender.send({
					type: Message.MessageType.OpenExternalURL,
					id: uuid.v4(),
					payload: 'https://meetalva.io/doc/docs/guides/start?guides-enabled=true'
				});
			}
		},
		{
			id: ids.github,
			label: '&Github',
			click: sender => {
				sender.send({
					type: Message.MessageType.OpenExternalURL,
					id: uuid.v4(),
					payload: 'https://github.com/meetalva/alva'
				});
			}
		},
		{
			id: ids.feedback,
			label: '&Feedback: hey@meetalva.io',
			click: sender => {
				sender.send({
					type: Message.MessageType.OpenExternalURL,
					id: uuid.v4(),
					payload: 'mailto:hey@meetalva.io'
				});
			}
		},
		{
			id: ids.site,
			label: '&Alva Website',
			click: sender => {
				sender.send({
					type: Message.MessageType.OpenExternalURL,
					id: uuid.v4(),
					payload: 'https://meetalva.io/'
				});
			}
		}
	]
});
