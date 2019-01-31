import * as M from '@meetalva/message';
import * as Serde from '../sender/serde';
import * as uuid from 'uuid';
import { MatcherCreator } from './context';

export const copy: MatcherCreator<M.Copy> = ({ host, dataHost }) => {
	return async m => {
		const project = await dataHost.getProject(m.payload.projectId);

		if (!project) {
			host.log(`copy: no resolveable project for ${m}`);
			return;
		}

		const item = project.getItem(m.payload.itemId, m.payload.itemType);

		if (!item) {
			host.log(`copy: no resolveable item for ${m}`);
			return;
		}

		return host.writeClipboard(
			Serde.serialize({
				type: M.MessageType.Clipboard,
				id: uuid.v4(),
				payload: {
					type: m.payload.itemType,
					item: item.toJSON(),
					project: project.toJSON()
				}
			})
		);
	};
};
