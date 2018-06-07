import * as uuid from 'uuid';

import * as Sender from '../message/client';
import { CreateScriptBundleResponse, ServerMessageType } from '../message';
import { previewDocument, PreviewDocumentMode } from '../preview/preview-document';
import { ViewStore } from '../store';
import * as Types from '../types';

export class HtmlExporter implements Types.Exporter {
	public contents: Buffer;
	private store: ViewStore;

	public constructor(store: ViewStore) {
		this.store = store;
	}

	public async execute(path: string): Promise<void> {
		const project = this.store.getProject();
		const patternLibrary = project.getPatternLibrary();
		const currentPage = this.store.getCurrentPage();
		const id = uuid.v4();

		const componentScript = {
			name: 'components',
			path: '',
			contents: Buffer.from(project.getPatternLibrary().getBundle())
		};

		// TODO: Come up with good user-facing errors
		if (!project || !currentPage) {
			// Todo: Implement error message
			return;
		}

		// (1) request bundled scripts
		const start = () => {
			Sender.send({
				type: ServerMessageType.CreateScriptBundleRequest,
				id,
				payload: project.toJSON()
			});
		};

		const receive = async message => {
			if (message.type !== ServerMessageType.CreateScriptBundleResponse || message.id !== id) {
				return;
			}

			const msg = message as CreateScriptBundleResponse;

			const scripts = [componentScript, ...msg.payload]
				.map(file => `<script data-script="${file.name}">${file.contents}<\/script>`)
				.join('\n');

			const data = {
				id: uuid.v4(),
				type: 'state',
				payload: {
					elementContents: project.getElementContents().map(e => e.toJSON()),
					elements: project.getElements().map(e => e.toJSON()),
					mode: PreviewDocumentMode.Static,
					pageId: currentPage.getId(),
					pages: project.getPages().map(page => page.toJSON()),
					patternProperties: patternLibrary.getPatternProperties().map(p => p.toJSON()),
					patterns: patternLibrary.getPatterns().map(p => p.toJSON())
				}
			};

			const document = previewDocument({
				content: '',
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
