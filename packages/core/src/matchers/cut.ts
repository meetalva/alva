import * as M from '../message';
import * as Serde from '../sender/serde';
import * as uuid from 'uuid';
import { MatcherCreator } from './context';

export const cut: MatcherCreator<M.Cut> = ({ host, dataHost }) => {
	return async m => {
		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			return;
		}

		await host.writeClipboard(
			Serde.serialize({
				type: M.MessageType.Clipboard,
				id: uuid.v4(),
				payload: {
					type: m.payload.itemType,
					item: m.payload.item,
					project: project.toJSON()
				}
			})
		);
	};
};
