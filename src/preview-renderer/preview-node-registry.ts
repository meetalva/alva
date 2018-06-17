import * as Model from '../model';

export class PreviewNodeRegistry {
	private elements = new WeakMap<Element | Text, Model.Element>();
	private ids = new WeakMap<Model.Element, Element | Text>();

	public add(item: { node: Element | Text; element: Model.Element }): void {
		this.elements.set(item.node, item.element);
		this.ids.set(item.element, item.node);
	}

	public getElementByNode(node: HTMLElement): Model.Element | undefined {
		let el = this.elements.get(node);

		while (!el && node.parentElement) {
			node = node.parentElement;
			el = this.elements.get(node);
		}

		return el;
	}

	public getNodeByElement(element: Model.Element): Element | undefined {
		const selectedNode = this.ids.get(element);

		if (!selectedNode) {
			return;
		}

		switch (selectedNode.nodeType) {
			case 1:
				return selectedNode as Element;
			case 3:
				return selectedNode.parentElement ? selectedNode.parentElement : undefined;
		}

		return;
	}

	public remove(item: { node: Element | Text; element: Model.Element }): void {
		this.elements.delete(item.node);
		this.ids.delete(item.element);
	}
}
