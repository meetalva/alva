import { PreviewComponentError } from './preview-component-error';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Injection } from '.';
import * as Types from '../types';

export interface PreviewComponentProps {
	element: Model.Element;
}

export type Injected = PreviewComponentProps & Injection;

@MobxReact.inject('store', 'registry')
@MobxReact.observer
export class PreviewComponent extends React.Component<PreviewComponentProps> {
	private disposeSelectReaction: () => void;
	private disposeHighlightReaction: () => void;

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

	private register(): void {
		const node = this.getDomElement();

		if (!node) {
			return;
		}

		const props = this.props as Injected;
		props.registry.add({ node, element: props.element });

		if (this.disposeSelectReaction) {
			this.disposeSelectReaction();
		}

		if (this.disposeHighlightReaction) {
			this.disposeHighlightReaction();
		}

		this.disposeSelectReaction = Mobx.autorun(() => {
			if (props.element.getSelected()) {
				const selectionArea = props.store.getSelectionArea();
				const rect = node.getBoundingClientRect();

				selectionArea.setSize({
					top: rect.top + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
					height: rect.height
				});
			}
		});

		this.disposeHighlightReaction = Mobx.autorun(() => {
			const children = props.element.getContentBySlotType(Types.SlotType.Children);
			const highlightArea = props.store.getHighlightArea();

			if (props.element.getRole() === Types.ElementRole.Root) {
				highlightArea.hide();
			} else {
				highlightArea.show();
			}

			if (props.element.getHighlighted() || (children && children.getHighlighted())) {
				const rect = node.getBoundingClientRect();

				highlightArea.setSize({
					top: rect.top + window.scrollY,
					left: rect.left + window.scrollX,
					width: rect.width,
					height: rect.height
				});
			}
		});
	}

	public componentDidMount(): void {
		this.register();
	}

	public componentDidUpdate(): void {
		this.register();
	}

	public componentWillUnmount(): void {
		const props = this.props as Injected;

		if (this.disposeSelectReaction) {
			this.disposeSelectReaction();
		}

		if (this.disposeHighlightReaction) {
			this.disposeHighlightReaction();
		}

		const node = ReactDom.findDOMNode(this);

		if (!node) {
			return;
		}

		props.registry.remove({ node, element: props.element });
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
