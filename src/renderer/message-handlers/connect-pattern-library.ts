import * as M from '../../message';
import { MessageHandlerContext, MessageHandler } from '../create-handlers';
import * as Types from '../../types';
import * as Model from '../../model';
import * as uuid from 'uuid';

export function connectPatternLibrary({
	store
}: MessageHandlerContext): MessageHandler<M.ConnectPatternLibraryResponse> {
	return m => {
		const project = store.getProject();

		if (!project) {
			return;
		}

		const analysis = m.payload.analysis;

		const library = Model.PatternLibrary.create({
			id: uuid.v4(),
			name: analysis.name,
			version: analysis.version,
			origin: Types.PatternLibraryOrigin.UserProvided,
			patternProperties: [],
			patterns: [],
			bundle: analysis.bundle,
			bundleId: analysis.id,
			description: analysis.description,
			state: Types.PatternLibraryState.Connected
		});

		library.import(analysis, { project });
		project.addPatternLibrary(library);

		store.getApp().setRightSidebarTab(Types.RightSidebarTab.ProjectSettings);
		store.commit();

		store.getSender().send({
			id: uuid.v4(),
			payload: {
				id: library.getId(),
				path: m.payload.path
			},
			type: M.MessageType.ConnectedPatternLibraryNotification
		});
	};
}
