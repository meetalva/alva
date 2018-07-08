import { computeDifference } from './compute-difference';
import { ElementArea } from './element-area';
import exportToSketchData from './export-to-sketch-data';
import { getComponents } from './get-components';
import { getInitialData } from './get-initial-data';
import * as Message from '../message';
import * as Mobx from 'mobx';
import * as Model from '../model';
import { PreviewStore, SyntheticComponents } from './preview-store';
import { Sender } from '../sender/preview';
import * as Types from '../types';
import * as uuid from 'uuid';

export interface Renderer<T> {
	render(store: PreviewStore<T>, container: HTMLElement): void;
	getSynthetics(): SyntheticComponents<T>;
}

declare global {
	interface Window {
		// tslint:disable-next-line:no-any
		renderer: Renderer<any>;
		rpc: {
			getDocumentSize(): Promise<{ width: number; height: number }>;
			// tslint:disable-next-line:no-any
			exportToSketchData(): Promise<any>;
		};
	}
}

function main(): void {
	const data = getInitialData();

	if (!data) {
		return;
	}

	// (1) Deserialize Project from HTML-embedded data payload
	const mode =
		data.mode === 'live' ? Types.PreviewDocumentMode.Live : Types.PreviewDocumentMode.Static;
	const project = Model.Project.from(data.data);

	// (2) Collect components from library scripts
	const components = getComponents(project);

	const store = new PreviewStore({
		mode,
		components,
		project,
		synthetics: window.renderer.getSynthetics(),
		selectionArea: new ElementArea(),
		highlightArea: new ElementArea()
	});

	window.addEventListener('keydown', e => {
		if (e.key === 'Meta') {
			store.setMetaDown(true);
		}
	});

	window.addEventListener('keyup', e => {
		if (e.key === 'Meta') {
			store.setMetaDown(false);
		}
	});

	// (3) Render the preview application
	window.renderer.render(store, document.getElementById('preview') as HTMLElement);

	// (4) Connect to the Alva server for updates
	// - when mode is "live", used for editable preview
	if (mode === Types.PreviewDocumentMode.Live) {
		const sender = new Sender({ endpoint: `ws://${window.location.host}` });
		store.setSender(sender);

		sender.receive(message => {
			Mobx.transaction(() => {
				switch (message.type) {
					case Message.ServerMessageType.KeyboardChange: {
						store.setMetaDown(message.payload.metaDown);
						break;
					}
					case Message.ServerMessageType.ChangePages: {
						const pages = message.payload.pages.map(p => Model.Page.from(p, { project }));
						const previousPages = project.getPages();
						const pageChanges = computeDifference<Model.Page>(pages, previousPages);

						pageChanges.added.forEach(change => project.addPage(change.after));
						pageChanges.changed.forEach(change => change.before.update(change.after));
						pageChanges.removed.forEach(change => project.removePage(change.before));

						break;
					}
					case Message.ServerMessageType.ChangeElements: {
						const contents = message.payload.elementContents.map(e =>
							Model.ElementContent.from(e, { project })
						);
						const previousContents = project.getElementContents();
						const contentChanges = computeDifference<Model.ElementContent>(
							contents,
							previousContents
						);

						const els = message.payload.elements.map(e => Model.Element.from(e, { project }));
						const previousElements = project.getElements();
						const elementChanges = computeDifference<Model.Element>(els, previousElements);

						contentChanges.added.forEach(change => project.addElementContent(change.after));
						contentChanges.removed.forEach(change =>
							project.removeElementContent(change.before)
						);
						contentChanges.changed.forEach(change => change.before.update(change.after));

						elementChanges.added.forEach(change => project.addElement(change.after));
						elementChanges.removed.forEach(change => project.removeElement(change.before));
						elementChanges.changed.forEach(change => change.before.update(change.after));

						const highlightedItem =
							contents.find(c => c.getHighlighted()) || els.find(e => e.getHighlighted());

						if (!highlightedItem) {
							store.unsetHighlightedElement();
							store.unsetHighlightedElementContent();
						}
						break;
					}
					case Message.ServerMessageType.ChangePatternLibraries: {
						const libraries = message.payload.patternLibraries.map(e =>
							Model.PatternLibrary.from(e)
						);

						const libraryChanges = computeDifference<Model.PatternLibrary>(
							libraries,
							project.getPatternLibraries()
						);

						libraryChanges.added.forEach(change => {
							const script = document.createElement('script');
							script.dataset.bundle = change.after.getBundleId();
							script.textContent = change.after.getBundle();
							document.body.appendChild(script);

							project.addPatternLibrary(change.after);
						});

						libraryChanges.changed.forEach(change => {
							const scriptCandidate = document.querySelector(
								`[data-bundle="${change.before.getBundleId()}"]`
							);

							if (scriptCandidate && scriptCandidate.parentElement) {
								scriptCandidate.parentElement.removeChild(scriptCandidate);
							}

							const script = document.createElement('script');
							script.dataset.bundle = change.after.getBundleId();
							script.textContent = change.after.getBundle();
							document.body.appendChild(script);

							change.before.update(change.after);
						});

						store.setComponents(getComponents(store.getProject()));
					}
				}
			});
		});

		// (5) Maintain selection area
		Mobx.autorun(() => {
			const selectedElement = store.getSelectedElement();

			const selectionNode = document.getElementById('preview-selection') as HTMLElement;
			const selectionArea = store.getSelectionArea();

			store.hasSelectedItem() ? selectionArea.show() : selectionArea.hide();

			if (selectedElement && selectedElement.getRole() === Types.ElementRole.Root) {
				selectionArea.hide();
			}

			selectionArea.write(selectionNode);
		});

		// (6) Maintain highlight area
		Mobx.autorun(() => {
			const highlightNode = document.getElementById('preview-highlight') as HTMLElement;
			const highlightArea = store.getHighlightArea();

			store.hasHighlightedItem() ? highlightArea.show() : highlightArea.hide();
			highlightArea.write(highlightNode);
		});

		// (7) Notify sytem about meta keypress
		Mobx.reaction(
			() => store.getMetaDown(),
			metaDown => {
				if (!sender) {
					return;
				}

				sender.send({
					id: uuid.v4(),
					payload: {
						metaDown
					},
					type: Message.PreviewMessageType.KeyboardChange
				});
			}
		);
	}
}

main();

window.rpc = {
	exportToSketchData,
	async getDocumentSize(): Promise<{ width: number; height: number }> {
		return {
			width: (document.scrollingElement || document.documentElement).scrollWidth,
			height: (document.scrollingElement || document.documentElement).scrollHeight
		};
	}
};
