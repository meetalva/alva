import { HighlightArea } from './highlight-area';
import { PreviewStore } from './preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Helmet } from 'react-helmet';
import * as Types from '../model/types';

export interface RenderInit {
	highlight: HighlightArea;
	store: PreviewStore;
	// tslint:disable-next-line:no-any
	getChildren(props: any, render: (props: any) => any): any;
	// tslint:disable-next-line:no-any
	getComponent(props: any, synthetics: any): React.Component | React.SFC | undefined;
	// tslint:disable-next-line:no-any
	getProperties(props: any): any;
	// tslint:disable-next-line:no-any
	getSlots(slots: any, render: (props: any) => any): any;
}

export interface PreviewHighlightProps {
	highlight: HighlightArea;
}

export interface PreviewApplicationProps {
	getChildren: RenderInit['getChildren'];
	getComponent: RenderInit['getComponent'];
	getProperties: RenderInit['getProperties'];
	getSlots: RenderInit['getSlots'];
	highlight: RenderInit['highlight'];
	store: RenderInit['store'];
}

interface PreviewComponentProps extends Types.SerializedElement {
	getChildren: RenderInit['getChildren'];
	getComponent: RenderInit['getComponent'];
	getProperties: RenderInit['getProperties'];
	getSlots: RenderInit['getSlots'];
	highlight: RenderInit['highlight'];
	store: RenderInit['store'];
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
	placeholder: props => <img src={props.src} style={{ width: '100%', height: 'auto' }} />,
	text: props => <span>{props.text}</span>
};

export function render(init: RenderInit): void {
	ReactDom.render(
		<PreviewApplication
			getChildren={init.getChildren}
			getComponent={init.getComponent}
			getProperties={init.getProperties}
			getSlots={init.getSlots}
			store={init.store}
			highlight={init.highlight}
		/>,
		document.getElementById('preview')
	);
}

class PreviewApplication extends React.Component<PreviewApplicationProps> {
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
			<React.Fragment>
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
			</React.Fragment>
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
	public componentWillUpdate(): void {
		const props = this.props;

		if (props.id === props.store.elementId) {
			const node = ReactDom.findDOMNode(this);
			if (node) {
				props.highlight.show(node as Element, props.id);
				setTimeout(() => {
					props.store.elementId = '';
				}, 500);
			}
		}
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
		const p = highlight.getProps();

		return (
			<div
				style={{
					position: 'absolute',
					boxSizing: 'border-box',
					border: '1px dashed rgba(55, 55, 55, .5)',
					background: `
					repeating-linear-gradient(
						135deg,
						transparent,
						transparent 2.5px,rgba(51, 141, 222, .5) 2.5px,
						rgba(51,141,222, .5) 5px),
						rgba(102,169,230, .5)`,
					transition: 'all .25s ease-in-out',
					bottom: p.bottom,
					height: p.height,
					left: p.left,
					opacity: p.opacity,
					right: p.right,
					top: p.top,
					width: p.width
				}}
			/>
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
