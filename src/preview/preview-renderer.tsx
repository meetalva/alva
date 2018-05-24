import { HighlightArea } from './highlight-area';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Helmet } from 'react-helmet';
import * as Types from '../model/types';

export interface PreviewHighlightProps {
	highlight: HighlightArea;
}

interface PreviewComponentProps {
	contentIds: Types.SerializedElement['contentIds'];
	getChildren: Types.RenderInit['getChildren'];
	getComponent: Types.RenderInit['getComponent'];
	getProperties: Types.RenderInit['getProperties'];
	getSlots: Types.RenderInit['getSlots'];
	highlight: Types.RenderInit['highlight'];
	id: Types.SerializedElement['id'];
	name: Types.SerializedElement['name'];
	patternId: Types.SerializedElement['patternId'];
	properties: Types.SerializedElement['properties'];
	store: Types.RenderInit['store'];
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
	placeholder: props =>
		props.src ? <img src={props.src} style={{ width: '100%', height: 'auto' }} /> : null,
	text: props => <span>{props.text}</span>
};

const ELEMENT_REGISTRY = new Map<Element | Text, string>();

export function render(init: Types.RenderInit): void {
	ReactDom.render(
		<PreviewApplication
			getChildren={init.getChildren}
			getComponent={init.getComponent}
			getProperties={init.getProperties}
			getSlots={init.getSlots}
			store={init.store}
			highlight={init.highlight}
			onElementClick={init.onElementClick}
			onOutsideClick={init.onOutsideClick}
		/>,
		document.getElementById('preview')
	);
}

class PreviewApplication extends React.Component<Types.RenderInit> {
	public constructor(props: Types.RenderInit) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
	}

	public componentDidMount(): void {
		document.addEventListener('click', this.handleClick);
	}

	public componentWillUnmount(): void {
		document.removeEventListener('click', this.handleClick);
	}

	private handleClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		const id = ELEMENT_REGISTRY.get(target);

		if (e.metaKey) {
			return;
		}

		if (!id) {
			this.props.onOutsideClick(e);
			return;
		}

		this.props.onElementClick(e, { id });
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

		const selectedElement = props.store.elements.find(e => e.id === props.store.elementId);

		if (selectedElement) {
			props.highlight.show();
		} else {
			props.highlight.hide();
		}

		return (
			<>
				<PreviewComponent
					contentIds={element.contentIds}
					getChildren={props.getChildren}
					getComponent={props.getComponent}
					getProperties={props.getProperties}
					getSlots={props.getSlots}
					highlight={props.highlight}
					id={element.id}
					name={element.name}
					patternId={element.patternId}
					properties={element.properties}
					store={props.store}
				/>
				<PreviewHighlight highlight={props.highlight} />
			</>
		);
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

class PreviewComponent extends React.Component<PreviewComponentProps> {
	public constructor(props: PreviewComponentProps) {
		super(props);
		this.handleResize = this.handleResize.bind(this);
	}

	public componentDidMount(): void {
		window.addEventListener('resize', this.handleResize);
		const node = ReactDom.findDOMNode(this);

		if (node) {
			ELEMENT_REGISTRY.set(node, this.props.id);
		}
	}

	public componentDidUpdate(): void {
		const props = this.props;

		if (props.id === props.store.elementId) {
			const node = ReactDom.findDOMNode(this);
			if (node) {
				props.highlight.setSize(node as Element);
			}
		}
	}

	public componentWillUnmount(): void {
		window.removeEventListener('resize', this.handleResize);
		const node = ReactDom.findDOMNode(this);

		if (node) {
			ELEMENT_REGISTRY.delete(node);
		}
	}

	private handleResize(): void {
		const props = this.props;
		if (props.id !== props.store.elementId) {
			return;
		}

		const node = ReactDom.findDOMNode(this);

		if (!node) {
			return;
		}

		props.highlight.update();
		window.requestAnimationFrame(this.handleResize);
	}

	public render(): JSX.Element | null {
		const props = this.props;

		const children = props.getChildren(props, (child: Types.SerializedElement) => (
			<PreviewComponent
				key={child.id}
				getChildren={props.getChildren}
				getComponent={props.getComponent}
				getProperties={props.getProperties}
				getSlots={props.getSlots}
				highlight={props.highlight}
				store={props.store}
				{...child}
			/>
		));

		const slots = props.getSlots(props, (child: Types.SerializedElement) => (
			<PreviewComponent
				key={child.id}
				getChildren={props.getChildren}
				getComponent={props.getComponent}
				getProperties={props.getProperties}
				getSlots={props.getSlots}
				highlight={props.highlight}
				store={props.store}
				{...child}
			/>
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
