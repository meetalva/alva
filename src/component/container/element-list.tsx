import { elementMenu } from '../../electron/context-menus';
import { ElementLocationCommand } from '../../store/command/element-location-command';
import { ElementWrapper } from './element-wrapper';
import { ListItemProps } from '../../lsg/patterns/list';
import { createMenu } from '../../electron/menu';
import { observer } from 'mobx-react';
import { Page } from '../../store/page/page';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/styleguide/pattern';
import { PropertyValue } from '../../store/page/property-value';
import * as React from 'react';
import { Store } from '../../store/store';
import * as uuid from 'uuid';

export interface ElementListState {
	dragging: boolean;
}

@observer
export class ElementList extends React.Component<{}, ElementListState> {
	public state = {
		dragging: false
	};

	public componentDidMount(): void {
		createMenu();
	}

	public componentWillUpdate(): void {
		createMenu();
	}

	public createItemFromElement(
		key: string,
		element: PageElement,
		selectedElement?: PageElement
	): ElementNodeProps {
		const pattern: Pattern | undefined = element.getPattern();

		if (!pattern) {
			return {
				label: key,
				title: '(invalid)',
				id: uuid.v4(),
				children: [],
				dragging: this.state.dragging
			};
		}

		return {
			label: key,
			title: element.getName(),
			dragging: this.state.dragging,
			id: element.getId(),
			onDragDropForChild: (e: React.DragEvent<HTMLElement>) => {
				this.handleDragEnd(e);
				const patternId = e.dataTransfer.getData('patternId');

				const newParent = element.getParent();
				let draggedElement: PageElement | undefined;

				const store = Store.getInstance();
				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();
					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!newParent || !draggedElement || draggedElement.isAncestorOf(newParent)) {
					return;
				}

				let newIndex = element.getIndex();
				if (draggedElement.getParent() === newParent) {
					const currentIndex = draggedElement.getIndex();
					if (newIndex > currentIndex) {
						newIndex--;
					}
					if (newIndex === currentIndex) {
						return;
					}
				}

				store.execute(ElementLocationCommand.addChild(newParent, draggedElement, newIndex));
				store.setSelectedElement(draggedElement);
			},
			onDragDrop: (e: React.DragEvent<HTMLElement>) => {
				this.handleDragEnd(e);
				const patternId = e.dataTransfer.getData('patternId');

				let draggedElement: PageElement | undefined;

				const store = Store.getInstance();
				if (!patternId) {
					draggedElement = store.getDraggedElement();
				} else {
					const styleguide = store.getStyleguide();

					if (!styleguide) {
						return;
					}

					draggedElement = new PageElement({
						pattern: styleguide.getPattern(patternId),
						setDefaults: true
					});
				}

				if (!draggedElement || draggedElement.isAncestorOf(element)) {
					return;
				}

				store.execute(ElementLocationCommand.addChild(element, draggedElement));
				store.setSelectedElement(draggedElement);
			},
			children: element
				.getChildren()
				.map((child, index, items) =>
					this.createItemFromProperty(
						items.length > 1 ? `Child ${index + 1}` : 'Child',
						child,
						selectedElement
					)
				),
			active: element === selectedElement
		};
	}

	public createItemFromProperty(
		key: string,
		value: PropertyValue,
		selectedElement?: PageElement
	): ElementNodeProps {
		if (Array.isArray(value)) {
			return {
				title: key,
				children: (value as (number | string)[]).map((child, index) =>
					this.createItemFromProperty(String(index + 1), child)
				),
				dragging: this.state.dragging,
				id: uuid.v4()
			};
		}

		if (value === undefined || value === null || typeof value !== 'object') {
			return { label: key, title: String(value), dragging: this.state.dragging, id: uuid.v4() };
		}

		if (value instanceof PageElement) {
			return this.createItemFromElement(key, value, selectedElement);
		}

		return {
			title: key,
			children: Object.entries(value).map(entry =>
				this.createItemFromProperty(entry[0], entry[1])
			),
			dragging: this.state.dragging,
			id: uuid.v4()
		};
	}

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target);
		e.stopPropagation();
		Store.getInstance().setSelectedElement(element);
		Store.getInstance().setElementFocussed(true);
	}

	private handleContextMenu(e: React.MouseEvent<HTMLElement>): void {
		const element = elementFromTarget(e.target);
		if (element) {
			elementMenu(element);
		}
	}

	private handleDragEnd(e: React.DragEvent<HTMLElement>): void {
		this.setState({ dragging: false });
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		this.setState({ dragging: true });
		const element = elementFromTarget(e.target);

		if (element) {
			Store.getInstance().setDraggedElement(element);
		}

		const target = e.target as HTMLElement;
		const dragElement = target.querySelector('div');

		// restyle the drag image and move it somewhere invisible
		if (dragElement) {
			const dragImg = dragElement.cloneNode(true) as HTMLElement;
			dragImg.setAttribute(
				'style',
				'position: absolute; background-color: #fff; color: #000; padding: 6px 18px; border-radius: 3px; font-size: 12px; opacity: 1; top: 0; left: -500px;'
			);
			document.body.appendChild(dragImg);
			e.dataTransfer.setDragImage(dragImg, 75, 15);
		}
	}

	public render(): JSX.Element | null {
		const store = Store.getInstance();
		const page: Page | undefined = store.getCurrentPage();

		if (!page) {
			return null;
		}

		const rootElement = page.getRoot();

		if (!rootElement) {
			return null;
		}

		const selectedElement = store.getSelectedElement();
		const item = this.createItemFromElement('Root', rootElement, selectedElement);

		return (
			<div
				onClick={e => this.handleClick(e)}
				onContextMenu={e => this.handleContextMenu(e)}
				onDragStart={e => this.handleDragStart(e)}
				onDragEnd={e => this.handleDragEnd(e)}
			>
				<ElementTree {...item} dragging={this.state.dragging} />
			</div>
		);
	}
}

export interface ElementNodeProps extends ListItemProps {
	children?: ElementNodeProps[];
	dragging: boolean;
	id: string;
}

function ElementTree(props: ElementNodeProps): JSX.Element {
	const children = Array.isArray(props.children) ? props.children : [];

	return (
		<ElementWrapper {...props} dragging={props.dragging}>
			{children.map(child => (
				<ElementTree {...child} key={child.id} dragging={props.dragging} />
			))}
		</ElementWrapper>
	);
}

function above(node: EventTarget, selector: string): HTMLElement | null {
	let el = node as HTMLElement;
	let ended = false;

	while (el && !ended) {
		if (el.matches(selector)) {
			break;
		}

		if (el.parentElement !== null) {
			el = el.parentElement;
		} else {
			ended = true;
			break;
		}
	}

	return ended ? null : el;
}

function elementFromTarget(target: EventTarget): PageElement | undefined {
	const el = above(target, '[data-id]');

	if (!el) {
		return;
	}

	const id = el.getAttribute('data-id');

	if (typeof id !== 'string') {
		return;
	}

	const store = Store.getInstance();
	const page = store.getCurrentPage();

	if (!page) {
		return;
	}

	return page.getElementById(id);
}
