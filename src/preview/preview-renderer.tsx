import { ComponentGetter } from './get-component';
import { HighlightArea } from './highlight-area';
import { omit } from 'lodash';
import * as MobX from 'mobx';
import * as MobXReact from 'mobx-react';
import { PreviewStore } from './preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
MobX.extras.shareGlobalState();

export interface RenderInit {
	getComponent: ComponentGetter<React.Component | React.SFC>;
	highlight: HighlightArea;
	store: PreviewStore;
}

export interface InjectedPreviewHighlightProps {
	highlight: HighlightArea;
}

export interface InjectedPreviewApplicationProps {
	highlight: HighlightArea;
	store: PreviewStore;
}

interface InjectedPreviewComponentProps extends PreviewComponentProps {
	getComponent: ComponentGetter<React.Component | React.SFC>;
	highlight: HighlightArea;
	store: PreviewStore;
}

export interface PreviewComponentProps {
	contents: {
		[slot: string]: PreviewComponentProps[];
	};
	exportName: string;
	name: string;
	pattern: string;
	// tslint:disable-next-line:no-any
	properties: { [key: string]: any };
	uuid: string;
}

interface ErrorBoundaryProps {
	name: string;
}

interface ErrorBoundaryState {
	errorMessage?: string;
}

export function render(init: RenderInit): void {
	console.log(init.store.pageId);
	ReactDom.render(
		<MobXReact.Provider
			getComponent={init.getComponent}
			store={init.store}
			highlight={init.highlight}
		>
			<PreviewApplication />
		</MobXReact.Provider>,
		document.getElementById('preview')
	);
}

interface ErrorMessageProps {
	error: string;
	patternName: string;
}

@MobXReact.inject('store', 'highlight')
@MobXReact.observer
class PreviewApplication extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewApplicationProps;
		const currentPage = props.store.pages.find(page => page.id === props.store.pageId);

		console.log(props.store.pageId);

		if (!currentPage) {
			return null;
		}

		const component = currentPage.root;

		return (
			<React.Fragment>
				<PreviewComponent
					contents={component.contents}
					exportName={component.exportName}
					pattern={component.pattern}
					properties={component.properties}
					name={component.name}
					uuid={component.uuid}
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

@MobXReact.inject('getComponent', 'store', 'highlight')
@MobXReact.observer
class PreviewComponent extends React.Component<PreviewComponentProps> {
	public componentWillUpdate(): void {
		const props = this.props as InjectedPreviewComponentProps;

		if (props.uuid === props.store.elementId) {
			const node = ReactDom.findDOMNode(this);
			if (node) {
				props.highlight.show(node as Element, props.uuid);
				setTimeout(() => {
					props.store.elementId = '';
				}, 500);
			}
		}
	}

	public render(): JSX.Element | null {
		const props = this.props as InjectedPreviewComponentProps;
		const contents = props.contents || {};
		const children = typeof contents.default === 'undefined' ? [] : contents.default;

		const renderedSlots = Object.keys(omit(contents, ['default'])).reduce(
			(previous, slotId) => ({
				...previous,
				[slotId]: contents[slotId].map(child => (
					<PreviewComponent key={child.uuid} {...child} />
				))
			}),
			{}
		);

		// Access elementId in render method to trigger MobX subscription
		// tslint:disable-next-line:no-unused-expression
		props.store.elementId;

		// tslint:disable-next-line:no-any
		const Component = props.getComponent(props, {
			// tslint:disable-next-line:no-any
			asset: (p: any) => {
				if (!p.asset || typeof p.asset !== 'string') {
					return null;
				}
				return <img src={p.asset} style={{ width: '100%', height: 'auto' }} />;
			},
			// tslint:disable-next-line:no-any
			page: (p: any) => <>{p.children}</>,
			// tslint:disable-next-line:no-any
			text: (p: any) => p.text
			// tslint:disable-next-line:no-any
		}) as any;

		if (!Component) {
			return null;
		}

		return (
			<ErrorBoundary name={props.name}>
				<Component {...props.properties} {...renderedSlots} data-sketch-name={props.name}>
					{children.map(child => <PreviewComponent key={child.uuid} {...child} />)}
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
