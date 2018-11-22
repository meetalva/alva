import * as M from '../../message';
import * as Types from '../../types';
import * as Serde from '../../sender/serde';
import * as uuid from 'uuid';

export function copy(server: Types.AlvaServer): (message: M.Copy) => Promise<void> {
	return async m => {
		const project = await server.dataHost.getProject(m.payload.projectId);

		if (!project) {
			return;
		}

		const item = project.getItem(m.payload.itemId, m.payload.itemType);

		if (!item) {
			return;
		}

		server.host.writeClipboard(
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
}
