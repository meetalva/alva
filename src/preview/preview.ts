import { computeDifference } from '../alva-util';
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

	document.body.addEventListener('mouseleave', () => {
		store.getProject().unsetHighlightedElement();
		store.getProject().unsetHighlightedElementContent();
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
					case Message.MessageType.KeyboardChange: {
						store.setMetaDown(message.payload.metaDown);
						break;
					}
					case Message.MessageType.ChangePages: {
						const changes = computeDifference<Model.Page>({
							after: message.payload.pages.map(p => Model.Page.from(p, { project })),
							before: project.getPages()
						});

						changes.added.forEach(change => project.addPage(change.after));
						changes.changed.forEach(change => change.before.update(change.after));
						changes.removed.forEach(change => project.removePage(change.before));

						break;
					}
					case Message.MessageType.ChangeElements: {
						const els = message.payload.elements.map(e => Model.Element.from(e, { project }));

						const changes = computeDifference<Model.Element>({
							before: project.getElements(),
							after: els
						});

						changes.added.forEach(change => project.addElement(change.after));
						changes.removed.forEach(change => project.removeElement(change.before));
						changes.changed.forEach(change => change.before.update(change.after));

						const selectedElement = els.find(e => e.getSelected());
						const highlightedElement = els.find(e => e.getHighlighted());

						if (selectedElement) {
							const el = project.getElementById(selectedElement.getId());
							if (el) {
								project.setSelectedElement(el);
							}
						}

						if (highlightedElement) {
							const el = project.getElementById(highlightedElement.getId());
							if (el) {
								project.setHighlightedElement(el);
							}
						}

						break;
					}
					case Message.MessageType.ChangeElementContents: {
						const contentChanges = computeDifference<Model.ElementContent>({
							before: project.getElementContents(),
							after: message.payload.elementContents.map(e =>
								Model.ElementContent.from(e, { project })
							)
						});
						contentChanges.added.forEach(change => project.addElementContent(change.after));
						contentChanges.removed.forEach(change =>
							project.removeElementContent(change.before)
						);
						contentChanges.changed.forEach(change => change.before.update(change.after));
						break;
					}
					case Message.MessageType.ChangeElementActions: {
						const changes = computeDifference<Model.ElementAction>({
							before: project.getElementActions(),
							after: message.payload.elementActions.map(e =>
								Model.ElementAction.from(e, { userStore: project.getUserStore() })
							)
						});
						changes.added.forEach(change => project.addElementAction(change.after));
						changes.removed.forEach(change => project.removeElementAction(change.before));
						changes.changed.forEach(change => change.before.update(change.after));
						break;
					}
					case Message.MessageType.ChangePatternLibraries: {
						const libraryChanges = computeDifference<Model.PatternLibrary>({
							before: project.getPatternLibraries(),
							after: message.payload.patternLibraries.map(e => Model.PatternLibrary.from(e))
						});

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

		Mobx.reaction(
			() => store.hasSelectedItem(),
			hasSelection => {
				const selectionArea = store.getSelectionArea();
				hasSelection ? selectionArea.show() : selectionArea.hide();
			}
		);

		Mobx.reaction(
			() => store.hasHighlightedItem(),
			hasHighlight => {
				const highlightArea = store.getHighlightArea();
				hasHighlight ? highlightArea.show() : highlightArea.hide();
			}
		);

		Mobx.autorun(() => {
			const selectionArea = store.getSelectionArea();
			const selectionNode = document.getElementById('preview-selection') as HTMLElement;
			selectionArea.write(selectionNode);
		});

		Mobx.autorun(() => {
			const highlightNode = document.getElementById('preview-highlight') as HTMLElement;
			const highlightArea = store.getHighlightArea();
			highlightArea.write(highlightNode);
		});

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
					type: Message.MessageType.KeyboardChange
				});
			}
		);

		Mobx.autorun(() => {
			const userStore = store.getProject().getUserStore();

			sender.send({
				id: uuid.v4(),
				payload: { userStore: userStore.toJSON() },
				type: Message.MessageType.UserStoreChange
			});
		});
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
