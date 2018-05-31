import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Helmet } from 'react-helmet';
import { SelectArea } from './select-area';
import * as Types from '../model/types';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
Mobx.extras.shareGlobalState();

export interface PreviewHighlightProps {
	highlight: SelectArea;
}

interface PreviewComponentProps {
	contentIds: Types.SerializedElement['contentIds'];
	id: Types.SerializedElement['id'];
	isRoot: boolean;
	name: Types.SerializedElement['name'];
	patternId: Types.SerializedElement['patternId'];
	properties: Types.SerializedElement['properties'];
}

interface StoreInjection {
	store: Types.RenderInit['store'];
}

interface GetChildrenInjection {
	getChildren: Types.RenderInit['getChildren'];
}

interface GetComponentInjection {
	getComponent: Types.RenderInit['getComponent'];
}

interface GetPropertiesInjection {
	getProperties: Types.RenderInit['getProperties'];
}

interface GetSlotsInjection {
	getSlots: Types.RenderInit['getSlots'];
}

interface UpdateSelectionInjection {
	updateSelection: SelectArea['setSize'];
}

interface ErrorBoundaryProps {
	name: string;
}

interface ErrorBoundaryState {
	errorMessage?: string;
}

interface ErrorMessageProps {
	error: string;
	patternName: string;
}

// tslint:disable-next-line:no-any
const Link: React.SFC = (props: any) => <a href={props.href}>{props.children}</a>;

// tslint:disable-next-line:no-any
const Page: React.SFC = (props: any) => (
	<>
		<Helmet>
			<html lang={props.lang} />
			{props.viewport && <meta name="viewport" content="width=device-width, initial-scale=1" />}
			{props.head}
		</Helmet>
		{props.content}
		{props.children}
	</>
);

// tslint:disable-next-line:no-any
const Box: React.SFC = (props: any) => {
	const style = {
		alignItems: props.alignItems,
		display: props.flex ? 'flex' : 'block',
		flexBasis: props.flexBasis,
		// tslint:disable-next-line:no-any
		flexDirection: props.column ? 'column' : (null as any),
		// tslint:disable-next-line:no-any
		flexWrap: props.wrap ? 'wrap' : ('nowrap' as any),
		flexGrow: props.flexGrow,
		flexShrink: props.flexShrink,
		justifyContent: props.justifyContent,
		order: props.order,
		width: props.width,
		height: props.height,
		backgroundColor: props.backgroundColor
	};

	return <div style={style}>{props.children}</div>;
};

const SYNTHETICS = {
	box: Box,
	page: Page,
	link: Link,
	placeholder: props =>
		props.src ? (
			<img
				src={props.src}
				style={{
					width: props.width,
					height: props.height,
					minWidth: props.minWidth,
					maxWidth: props.maxWidth,
					minHeight: props.minHeight,
					maxHeight: props.maxHeight
				}}
			/>
		) : null,
	text: props => <span>{props.text}</span>
};

const ELEMENT_REGISTRY = new WeakMap<Element | Text, string>();
const ID_REGISTRY = new Map<string, Element | Text>();

export function render(init: Types.RenderInit, container: HTMLElement): void {
	const selection = new SelectArea();

	ReactDom.render(
		<MobxReact.Provider
			getChildren={init.getChildren}
			getComponent={init.getComponent}
			getProperties={init.getProperties}
			getSlots={init.getSlots}
			store={init.store}
			updateSelection={node => selection.setSize(node)}
		>
			<PreviewApplication
				onElementClick={init.onElementClick}
				onOutsideClick={init.onOutsideClick}
				onElementSelect={init.onElementSelect}
				selection={selection}
				store={init.store}
			/>
		</MobxReact.Provider>,
		container
	);
}

interface PreviewApplicationProps {
	onElementClick: Types.RenderInit['onElementClick'];
	onElementSelect: Types.RenderInit['onElementSelect'];
	onOutsideClick: Types.RenderInit['onOutsideClick'];
	selection: SelectArea;
	store: Types.RenderInit['store'];
}

@MobxReact.observer
class PreviewApplication extends React.Component<PreviewApplicationProps> {
	private disposer: () => void;
	private observer: MutationObserver;

	public constructor(props: PreviewApplicationProps) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleResize = this.handleResize.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('click', this.handleClick);
		window.addEventListener('resize', this.handleResize);

		this.observer = new MutationObserver(mutations => {
			mutations.forEach(mutation => {
				// tslint:disable-next-line:prefer-for-of
				for (let i = 0; i < mutation.addedNodes.length; i++) {
					const addedNode = mutation.addedNodes[i];
					const id = ELEMENT_REGISTRY.get(addedNode as HTMLElement);
					if (id === this.props.store.elementId) {
						this.updateSelection();
					}
				}
			});
		});

		this.observer.observe(document.body, { childList: true, subtree: true });

		this.disposer = Mobx.autorun(() => {
			this.updateSelection();
		});

		this.updateSelection();
	}

	public componentWillUnmount(): void {
		document.removeEventListener('click', this.handleClick);
		window.removeEventListener('resize', this.handleResize);

		if (this.disposer) {
			this.disposer();
		}

		if (this.observer) {
			this.observer.disconnect();
		}
	}

	private handleClick(e: MouseEvent): void {
		const id = getElementIdByNode(e.target as HTMLElement);

		if (!id) {
			this.props.onOutsideClick(e);
			return;
		}

		this.props.onElementSelect(e, { id });

		const clickedIds = new Set();
		let node: HTMLElement | null = e.target as HTMLElement;

		while (node) {
			const clickedId = getElementIdByNode(node);

			if (clickedId) {
				clickedIds.add(clickedId);
			}

			node = node.parentElement;
		}

		clickedIds.forEach(clickedId => this.props.onElementClick(e, { id: clickedId }));
	}

	private handleResize(): void {
		window.requestAnimationFrame(() => this.updateSelection());
	}

	public render(): JSX.Element | null {
		const props = this.props;
		const currentPage = props.store.pages.find(page => page.id === props.store.pageId);

		if (!currentPage) {
			return null;
		}

		const element = props.store.elements.find(e => e.id === currentPage.rootId);

		if (!element) {
			return null;
		}

		return (
			<>
				<PreviewComponent
					contentIds={element.contentIds}
					id={element.id}
					isRoot
					name={element.name}
					patternId={element.patternId}
					properties={element.properties}
				/>
				<PreviewHighlight highlight={props.selection} />
			</>
		);
	}

	private updateSelection(elementId?: string): void {
		const id = elementId || this.props.store.elementId;
		const node = getNodeByElementId(id);

		if (node) {
			this.props.selection.show();
			this.props.selection.setSize(node);
		} else {
			this.props.selection.hide();
		}

		const currentPage = this.props.store.pages.find(page => page.id === this.props.store.pageId);

		if (!currentPage) {
			return;
		}

		const element = this.props.store.elements.find(e => e.id === currentPage.rootId);

		if (!element) {
			return;
		}

		if (element.id === id) {
			this.props.selection.hide();
		}
	}
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	public state = {
		errorMessage: ''
	};

	public componentDidCatch(error: Error): void {
		this.setState({
			errorMessage: error.message
		});
	}

	public render(): JSX.Element {
		if (this.state.errorMessage) {
			return <ErrorMessage patternName={this.props.name} error={this.state.errorMessage} />;
		}
		return this.props.children as JSX.Element;
	}
}

type InjectedPreviewComponentProps = PreviewComponentProps &
	StoreInjection &
	GetChildrenInjection &
	GetSlotsInjection &
	GetPropertiesInjection &
	GetComponentInjection &
	UpdateSelectionInjection &
	StoreInjection;

@MobxReact.inject('store')
@MobxReact.inject('getChildren')
@MobxReact.inject('getSlots')
@MobxReact.inject('getProperties')
@MobxReact.inject('getComponent')
@MobxReact.inject('updateSelection')
@MobxReact.observer
class PreviewComponent extends React.Component<PreviewComponentProps> {
	public componentDidMount(): void {
		if (this.props.isRoot) {
			return;
		}

		const node = ReactDom.findDOMNode(this);
		if (node) {
			ELEMENT_REGISTRY.set(node, this.props.id);
			ID_REGISTRY.set(this.props.id, node);
		}
	}

	public componentDidUpdate(): void {
		if (this.props.isRoot) {
			return;
		}

		const node = ReactDom.findDOMNode(this);
		const props = this.props as InjectedPreviewComponentProps;

		if (node) {
			ELEMENT_REGISTRY.set(node, this.props.id);
			ID_REGISTRY.set(this.props.id, node);
		}

		if (props.store.elementId === this.props.id && node && node.nodeType === 1) {
			props.updateSelection(node as HTMLElement);
		}
	}

	public componentWillUnmount(): void {
		if (this.props.isRoot) {
			return;
		}

		const node = ReactDom.findDOMNode(this);
		ID_REGISTRY.delete(this.props.id);

		if (node) {
			ELEMENT_REGISTRY.delete(node);
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewComponentProps;

		const children = props.getChildren(props, (child: Types.SerializedElement) => (
			<PreviewComponent isRoot={false} key={child.id} {...child} />
		));

		const slots = props.getSlots(props, (child: Types.SerializedElement) => (
			<PreviewComponent isRoot={false} key={child.id} {...child} />
		));

		const properties = props.getProperties(props.properties);

		// tslint:disable-next-line:no-any
		const Component = props.getComponent(props, SYNTHETICS) as any;

		if (!Component) {
			return null;
		}

		return (
			<ErrorBoundary name={props.name}>
				<Component {...properties} {...slots}>
					{children}
				</Component>
			</ErrorBoundary>
		);
	}
}

@MobxReact.observer
class PreviewHighlight extends React.Component<PreviewHighlightProps> {
	public render(): JSX.Element {
		const props = this.props;
		const { highlight } = props;

		return (
			<div
				style={{
					position: 'absolute',
					boxSizing: 'border-box',
					border: '1px solid rgba(255, 255, 255, 0.5)',
					bottom: highlight.bottom,
					height: highlight.height,
					left: highlight.left,
					opacity: highlight.opacity,
					right: highlight.right,
					top: highlight.top,
					width: highlight.width,
					pointerEvents: 'none',
					mixBlendMode: 'difference'
				}}
			>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						maxWidth: '12px',
						maxHeight: '12px',
						borderRadius: '3px 0 0 0',
						borderLeft: '3px solid rgba(255, 255, 255, 0.75)',
						borderTop: '3px solid rgba(255, 255, 255, 0.75)',
						left: '-2px',
						top: '-2px'
					}}
				/>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						maxWidth: '12px',
						maxHeight: '12px',
						borderRadius: '0 3px 0 0',
						borderRight: '3px solid rgba(255, 255, 255, 0.75)',
						borderTop: '3px solid rgba(255, 255, 255, 0.75)',
						right: '-2px',
						top: '-2px'
					}}
				/>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						maxWidth: '12px',
						maxHeight: '12px',
						borderRadius: '0 0 0 3px',
						borderLeft: '3px solid rgba(255, 255, 255, 0.75)',
						borderBottom: '3px solid rgba(255, 255, 255, 0.75)',
						left: '-2px',
						bottom: '-2px'
					}}
				/>
				<div
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%',
						maxWidth: '12px',
						maxHeight: '12px',
						borderRadius: '0 0 3px 0',
						borderRight: '3px solid rgba(255, 255, 255, 0.75)',
						borderBottom: '3px solid rgba(255, 255, 255, 0.75)',
						right: '-2px',
						bottom: '-2px'
					}}
				/>
			</div>
		);
	}
}

const ErrorMessage: React.StatelessComponent<ErrorMessageProps> = props => (
	<div
		style={{
			backgroundColor: 'rgb(240, 40, 110)',
			color: 'white',
			padding: '12px 15px',
			textAlign: 'center'
		}}
	>
		<p
			style={{
				margin: '0',
				fontFamily:
					'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
				fontSize: '15px',
				lineHeight: '22px'
			}}
		>
			{`<${props.patternName}/> failed to render: ${props.error}`}
		</p>
	</div>
);

function getElementIdByNode(node: HTMLElement): string | undefined {
	let id = ELEMENT_REGISTRY.get(node);

	while (!id && node.parentElement) {
		node = node.parentElement;
		id = ELEMENT_REGISTRY.get(node);
	}

	return id;
}

function getNodeByElementId(id: string): Element | undefined {
	const selectedNode = ID_REGISTRY.get(id);

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
