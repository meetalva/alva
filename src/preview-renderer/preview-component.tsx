import { PreviewComponentError } from './preview-component-error';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Types from '../types';
import { Injection } from '.';

export interface PreviewComponentProps {
	element: Model.Element;
}

export type Injected = PreviewComponentProps & Injection;

@MobxReact.inject('store')
@MobxReact.observer
export class PreviewComponent extends React.Component<PreviewComponentProps> {
	private getDomElement(): Element | undefined {
		const node = ReactDom.findDOMNode(this);

		if (!node) {
			return;
		}

		if (!node.parentElement) {
			return;
		}

		if (node.nodeType === Node.TEXT_NODE) {
			return node.parentElement;
		}

		return node as Element;
	}

	private handleMouseOver(e: MouseEvent): void {
		const props = this.props as Injected;
		e.stopPropagation();
		props.store.onElementMouseOver(e, { element: props.element, node: this.getDomElement() });
	}

	private handleClick(e: MouseEvent): void {
		const props = this.props as Injected;
		props.store.onElementClick(e, { element: props.element, node: this.getDomElement() });
	}

	private update(): void {
		const props = this.props as Injected;

		const children = props.element.getContentBySlotType(Types.SlotType.Children);

		if (props.element.getHighlighted() || (children && children.getHighlighted())) {
			props.store.updateHighlightedElement({
				element: props.element,
				node: this.getDomElement()
			});
		}

		if (props.element.getSelected()) {
			props.store.updateSelectedElement({ element: props.element, node: this.getDomElement() });
		}
	}

	public componentDidMount(): void {
		const el = this.getDomElement();

		if (!el) {
			return;
		}

		this.handleClick = this.handleClick.bind(this);
		this.handleMouseOver = this.handleMouseOver.bind(this);

		el.addEventListener('click', this.handleClick);
		el.addEventListener('mouseover', this.handleMouseOver);

		this.update();
	}

	public componentDidUpdate(): void {
		this.update();
	}

	public componentWillUnmount(): void {
		const el = this.getDomElement();

		if (!el) {
			return;
		}

		el.removeEventListener('click', this.handleClick);
		el.removeEventListener('mouseover', this.handleMouseOver);
	}

	public render(): JSX.Element | null {
		const props = this.props as Injected;

		const children = props.store.getChildren(props.element, child => (
			<PreviewComponent key={child.getId()} element={child} />
		));

		const slots = props.store.getSlots(props.element, child => (
			<PreviewComponent key={child.getId()} element={child} />
		));

		const properties = props.store.getProperties(props.element);
		const Component = props.store.getComponent(props.element);

		if (!Component) {
			return null;
		}

		return (
			<PreviewComponentError name={props.element.getName()}>
				<Component {...properties} {...slots}>
					{children}
				</Component>
			</PreviewComponentError>
		);
	}
}
