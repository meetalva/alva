import * as uuid from 'uuid';

import * as Sender from '../message/client';
import { ServerMessageType } from '../message';
import { previewDocument, PreviewDocumentMode } from '../preview/preview-document';
import { ViewStore } from '../store';
import * as Types from '../model/types';

export class HtmlExporter implements Types.Exporter {
	public contents: Buffer;

	public async execute(path: string): Promise<void> {
		const store = ViewStore.getInstance();
		const project = store.getProject();
		const currentPage = store.getCurrentPage();
		const styleguide = store.getPatternLibrary();
		const id = uuid.v4();

		// TODO: Come up with good user-facing errors
		if (!project || !currentPage || !styleguide) {
			// Todo: Implement error message
			return;
		}

		// (1) request bundled scripts
		const start = () => {
			Sender.send({
				type: ServerMessageType.CreateScriptBundleRequest,
				id,
				payload: styleguide
			});
		};

		const receive = async message => {
			if (message.type !== ServerMessageType.CreateScriptBundleResponse || message.id !== id) {
				return;
			}

			const data = {
				id: uuid.v4(),
				type: 'state',
				payload: {
					mode: PreviewDocumentMode.Static,
					pageId: currentPage.getId(),
					pages: project.getPages().map(page => page.toJSON())
				}
			};

			const scripts = message.payload;

			const document = previewDocument({
				data,
				mode: PreviewDocumentMode.Static,
				scripts
			});

			this.contents = Buffer.from(document);

			Sender.send({
				id: uuid.v4(),
				type: ServerMessageType.ExportHTML,
				payload: { path, content: this.contents }
			});
		};

		Sender.receive(receive);
		start();
	}
}
