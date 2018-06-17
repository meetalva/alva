import * as MobxReact from 'mobx-react';
import { PreviewComponent } from './preview-component';
import * as React from 'react';
import { Injection } from '.';

@MobxReact.inject('store', 'registry')
@MobxReact.observer
export class PreviewApplication extends React.Component {
	// private disposer: () => void;
	// private observer: MutationObserver;

	public componentDidMount(): void {
		// const props = this.props as Injection;
		document.addEventListener('mouseover', e => this.handleMouseOver(e));
		document.addEventListener('click', e => this.handleClick(e));
		/* this.observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				// tslint:disable-next-line:prefer-for-of
				for (let i = 0; i < mutation.addedNodes.length; i++) {
					const addedNode = mutation.addedNodes[i];
					const element = props.registry.getElementByNode(addedNode as HTMLElement);

					if (!element) {
						continue;
					}

					if (element && element.getSelected()) {
						this.updateSelection();
					}
				}
			});
		});

		this.observer.observe(document.body, { childList: true, subtree: true });

		this.disposer = Mobx.autorun(() => {
			this.updateSelection();
			this.updateHighlight();
		});

		this.updateSelection();
		this.updateHighlight(); */
	}

	public componentWillUnmount(): void {
		document.removeEventListener('mouseover', this.handleMouseOver);
		document.removeEventListener('click', this.handleClick);

		/* if (this.disposer) {
			this.disposer();
		}

		if (this.observer) {
			this.observer.disconnect();
		} */
	}

	private handleClick(e: MouseEvent): void {
		const props = this.props as Injection;

		const el = props.registry.getElementByNode(e.target as HTMLElement);

		if (!el) {
			props.store.onOutsideClick(e);
			return;
		}

		props.store.onElementSelect(e, el);

		const clickedElements = new Set();
		let node: HTMLElement | null = e.target as HTMLElement;

		while (node) {
			const clickedElement = props.registry.getElementByNode(node);

			if (clickedElement) {
				clickedElements.add(clickedElement);
			}

			node = node.parentElement;
		}

		clickedElements.forEach(clickedElement => props.store.onElementClick(e, clickedElement));
	}

	private handleMouseOver(e: MouseEvent): void {
		const props = this.props as Injection;
		const el = props.registry.getElementByNode(e.target as HTMLElement);
		if (el) {
			props.store.onElementMouseOver(e, el);
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as Injection;
		const activePage = props.store.getActivePage();

		if (!activePage) {
			return null;
		}

		const element = activePage.getRoot();

		if (!element) {
			return null;
		}

		return <PreviewComponent element={element} />;
	}
}
