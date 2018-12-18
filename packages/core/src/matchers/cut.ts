import * as M from '../message';
import * as T from '../types';
import * as Serde from '../sender/serde';
import * as uuid from 'uuid';

export function cut({ host, dataHost }: T.MatcherContext): T.Matcher<M.Cut> {
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
}
