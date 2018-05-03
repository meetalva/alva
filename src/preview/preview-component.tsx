import { ErrorBoundary } from './error-boundary';
import { camelCase, omit, upperFirst } from 'lodash';
import { PreviewMessageType } from '../message';
import * as MobXReact from 'mobx-react';
import { PageElement } from './store/page-element';
import { patternIdToWebpackName } from './pattern-id-to-webpack-name';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Store } from './store/store';

export interface PreviewComponentProps {
	connection: WebSocket;
	contents: {
		[slot: string]: PageElement[];
	};
	exportName: string;
	name: string;
	pattern: string;
	// tslint:disable-next-line:no-any
	properties: { [key: string]: any };
	uuid: string;
}

// tslint:disable-next-line:no-any
function getComponent(props: PreviewComponentProps): any {
	if (props.pattern === 'synthetic:text') {
		return p => p.text;
	} else if (props.pattern === 'synthetic:asset') {
		// tslint:disable-next-line:no-any
		return p => {
			if (!p.src || typeof p.src !== 'string') {
				return null;
			}
			return <img src={p.src} style={{ width: '100%', height: 'auto' }} onClick={p.onClick} />;
		};
	}

	// tslint:disable-next-line:no-any
	const win: any = window;

	const component = props.pattern ? win.components[patternIdToWebpackName(props.pattern)] : null;
	if (!component) {
		return;
	}

	const Component = resolveExport(component, props.exportName);
	if (!Component) {
		return;
	}

	// tslint:disable-next-line:no-any
	(Component as any).displayName = upperFirst(camelCase(props.name));
	return Component;
}

// tslint:disable-next-line:no-any
function resolveExport<T>(candidate: any, exportName: string): T | undefined {
	if (exportName === 'default') {
		const Component = typeof candidate.default === 'function' ? candidate.default : candidate;
		return Component;
	}

	return candidate[exportName];
}

@MobXReact.observer
export class PreviewComponent extends React.Component<PreviewComponentProps> {
	public componentWillUpdate(): void {
		const store = Store.getInstance();
		if (this.props.uuid === store.selectedElementId) {
			const node = ReactDom.findDOMNode(this);
			if (node) {
				store.highlightArea.show(node as Element, this.props.uuid);
				setTimeout(() => {
					store.selectedElementId = '';
				}, 500);
			}
		}
	}

	public render(): JSX.Element | null {
		const contents = this.props.contents || {};
		const children = typeof contents.default === 'undefined' ? [] : contents.default;

		const renderedSlots = Object.keys(omit(contents, ['default'])).reduce(
			(previous, slotId) => ({
				...previous,
				[slotId]: contents[slotId].map(child => (
					<PreviewComponent key={child.uuid} connection={this.props.connection} {...child} />
				))
			}),
			{}
		);

		// Access elementId in render method to trigger MobX subscription
		// tslint:disable-next-line:no-unused-expression
		Store.getInstance().selectedElementId;

		// tslint:disable-next-line:no-any
		const Component = getComponent(this.props) as any;
		if (!Component) {
			return null;
		}

		const properties = {};
		Object.keys(this.props.properties).forEach((name: string) => {
			let propertyValue = this.props.properties[name];

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

					this.props.connection.send(
						JSON.stringify({
							type: PreviewMessageType.SetVariable,
							payload: { variable: action.variable, inputValue }
						})
					);
				};
			} else if (propertyValue['_type'] === 'open-page-event-action') {
				const action = propertyValue;
				propertyValue = (event: Event) => {
					this.props.connection.send(
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
			<ErrorBoundary name={this.props.name}>
				<Component {...properties} {...renderedSlots} data-sketch-name={this.props.name}>
					{children.map(child => (
						<PreviewComponent
							key={child.uuid}
							connection={this.props.connection}
							{...child}
						/>
					))}
				</Component>
			</ErrorBoundary>
		);
	}
}
