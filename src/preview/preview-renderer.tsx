// import { ComponentGetter } from './get-component';
import { HighlightArea } from './highlight-area';
import * as MobX from 'mobx';
import * as MobXReact from 'mobx-react';
import { PreviewStore } from './preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Helmet } from 'react-helmet';
import * as Types from '../store/types';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
MobX.extras.shareGlobalState();

export interface RenderInit {
	highlight: HighlightArea;
	store: PreviewStore;
	// tslint:disable-next-line:no-any
	getComponent(props: any, synthetics: any): React.Component | React.SFC | undefined;
	// tslint:disable-next-line:no-any
	getProperties(props: any): any;
	// tslint:disable-next-line:no-any
	getSlots(slots: any, render: (props: any) => any): any;
}

export interface InjectedPreviewHighlightProps {
	highlight: HighlightArea;
}

export interface InjectedPreviewApplicationProps {
	highlight: HighlightArea;
	store: PreviewStore;
}

interface InjectedPreviewComponentProps extends Types.SerializedElement {
	getComponent: RenderInit['getComponent'];
	getProperties: RenderInit['getProperties'];
	getSlots: RenderInit['getSlots'];
	highlight: HighlightArea;
	store: PreviewStore;
	// tslint:disable-next-line:no-any
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

const SYNTHETICS = {
	page: Page,
	placeholder: props => <img src={props.src} style={{ width: '100%', height: 'auto' }} />,
	text: props => <span>{props.text}</span>
};

export function render(init: RenderInit): void {
	ReactDom.render(
		<MobXReact.Provider
			getComponent={init.getComponent}
			getProperties={init.getProperties}
			getSlots={init.getSlots}
			store={init.store}
			highlight={init.highlight}
		>
			<PreviewApplication />
		</MobXReact.Provider>,
		document.getElementById('preview')
	);
}

@MobXReact.inject('store', 'highlight')
@MobXReact.observer
class PreviewApplication extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewApplicationProps;
		const currentPage = props.store.pages.find(page => page.id === props.store.pageId);

		if (!currentPage) {
			return null;
		}

		const component = currentPage.root;

		return (
			<React.Fragment>
				<PreviewComponent
					contents={component.contents}
					pattern={component.pattern}
					properties={component.properties}
					name={component.name}
					id={component.id}
				/>
				<PreviewHighlight />
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

@MobXReact.inject('getComponent', 'getProperties', 'getSlots', 'store', 'highlight')
@MobXReact.observer
class PreviewComponent extends React.Component<Types.SerializedElement> {
	public componentWillUpdate(): void {
		const props = this.props as InjectedPreviewComponentProps;

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
		const props = this.props as InjectedPreviewComponentProps;

		const defaultContent = props.contents.find(content => content.slotType === 'children');
		const children = defaultContent ? defaultContent.elements : [];

		const slotsContents = props.contents.filter(content => content.slotType !== 'children');
		const slots = props.getSlots(slotsContents, child => (
			<PreviewComponent key={child.id} {...child} />
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
					{children.map(child => <PreviewComponent key={child.id} {...child} />)}
				</Component>
			</ErrorBoundary>
		);
	}
}

@MobXReact.inject('store', 'highlight')
@MobXReact.observer
class PreviewHighlight extends React.Component {
	public render(): JSX.Element {
		const props = this.props as InjectedPreviewHighlightProps;
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
