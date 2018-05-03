import { ComponentGetter } from './get-component';
import { HighlightArea } from './highlight-area';
import { omit } from 'lodash';
import { PreviewMessageType } from '../message';
import * as MobX from 'mobx';
import * as MobXReact from 'mobx-react';
import { PreviewStore } from './preview';
import * as React from 'react';
import * as ReactDom from 'react-dom';

// TODO: Produces a deprecation warning, find a way
// to dedupe MobX when upgrading to 4.x
MobX.extras.shareGlobalState();

export interface RenderProps {
	connection: WebSocket;
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

export function render(renderProps: RenderProps): void {
	@MobXReact.inject('store', 'highlight')
	@MobXReact.observer
	class PreviewApplication extends React.Component {
		public render(): JSX.Element | null {
			const props = this.props as InjectedPreviewApplicationProps;
			const page = props.store.page;

			if (!page) {
				return null;
			}

			const component = page.root;

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

	@MobXReact.inject('store', 'highlight')
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
			const Component = renderProps.getComponent(props, {
				// tslint:disable-next-line:no-any
				text: (p: any) => p.text,
				// tslint:disable-next-line:no-any
				asset: (p: any) => {
					if (!p.asset || typeof p.asset !== 'string') {
						return null;
					}
					return <img src={p.asset} style={{ width: '100%', height: 'auto' }} />;
				}
				// tslint:disable-next-line:no-any
			}) as any;

			if (!Component) {
				return null;
			}

			const properties = {};
			Object.keys(props.properties).forEach((name: string) => {
				let propertyValue = props.properties[name];

				if (propertyValue['_type'] === 'set-variable-event-action') {
					const action = propertyValue;
					propertyValue = (event: Event) => {
						let inputValue;

						const target = event.currentTarget;
						if (
							target instanceof HTMLInputElement ||
							target instanceof HTMLSelectElement ||
							target instanceof HTMLTextAreaElement
						) {
							inputValue = target.value;
						}

						if (inputValue !== undefined && inputValue !== null) {
							const type: string = typeof inputValue;
							if (type !== 'string' && type !== 'number' && type !== 'boolean') {
								inputValue = inputValue.toString();
							}
						}

						renderProps.connection.send(
							JSON.stringify({
								type: PreviewMessageType.SetVariable,
								payload: { variable: action.variable, inputValue }
							})
						);
					};
				} else if (propertyValue['_type'] === 'open-page-event-action') {
					const action = propertyValue;
					propertyValue = (event: Event) => {
						renderProps.connection.send(
							JSON.stringify({
								type: PreviewMessageType.OpenPage,
								payload: action.pageId
							})
						);
					};
				}

				properties[name] = propertyValue;
			});

			return (
				<ErrorBoundary name={props.name}>
					<Component {...properties} {...renderedSlots} data-sketch-name={props.name}>
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

	ReactDom.render(
		<MobXReact.Provider store={renderProps.store} highlight={renderProps.highlight}>
			<PreviewApplication />
		</MobXReact.Provider>,
		document.getElementById('preview')
	);
}

interface ErrorMessageProps {
	error: string;
	patternName: string;
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
