import { observer } from 'mobx-react';
import { Page } from '../../store/page/page';
import { PageElement } from '../../store/page/page-element';
import { Pattern } from '../../store/pattern/pattern';
import { PropertyValue } from '../../store/page/property-value';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SmoothscrollPolyfill from 'smoothscroll-polyfill';
import { TextPattern } from '../../store/pattern/text-pattern';

class PatternWrapper extends React.Component<{}, PatternWrapperState> {
	public constructor(props: {}) {
		super(props);
		this.state = {};
	}

	public componentDidCatch(error: Error): void {
		this.setState({ errorMessage: error.message });
	}

	public render(): React.ReactNode {
		if (this.state.errorMessage) {
			return <span>{this.state.errorMessage}</span>;
		} else {
			return this.props.children;
		}
	}
}

export interface HighlightAreaProps extends ClientRect {
	opacity?: number;
}

export interface PreviewProps {
	page?: Page;
	selectedElementId?: number[];
}

export interface PreviewState {
	highlightArea: HighlightAreaProps;
}

@observer
export class Preview extends React.Component<PreviewProps, PreviewState> {
	private patternFactories: { [folder: string]: React.StatelessComponent };

	public constructor(props: PreviewProps) {
		super(props);
		this.patternFactories = {};

		this.state = {
			highlightArea: {
				bottom: 0,
				height: 0,
				left: 0,
				opacity: 0,
				right: 0,
				top: 0,
				width: 0
			}
		};
	}

	public componentDidUpdate(prevProps: PreviewProps, prevState: PreviewState): void {
		if (this.state.highlightArea.opacity !== 0) {
			setTimeout(() => {
				this.setState({
					highlightArea: {
						...this.state.highlightArea,
						opacity: 0
					}
				});
			}, 500);
		}
	}

	public render(): JSX.Element | null {
		SmoothscrollPolyfill.polyfill();
		if (this.props.page) {
			const highlightArea: HighlightAreaProps = this.state.highlightArea;
			return (
				<>
					{this.createComponent(this.props.page.getRoot()) as JSX.Element}
					<div
						style={{
							position: 'absolute',
							boxSizing: 'border-box',
							border: '1px dashed rgba(55, 55, 55, .5)',
							background: 'rgba(102,169,230, .5)',
							mixBlendMode: 'multiply',
							transition: 'all .25s ease-in-out',
							bottom: highlightArea.bottom,
							height: highlightArea.height,
							left: highlightArea.left,
							opacity: highlightArea.opacity,
							right: highlightArea.right,
							top: highlightArea.top,
							width: highlightArea.width
						}}
					/>
				</>
			);
		}
		return null;
	}

	/**
	 * Converts a JSON-serializable declaration of a pattern, primitive, or collection
	 * into a React component (or primitive), deep-traversing through properties and children.
	 * @param value The value, may be a page element (a pattern declaration),
	 * a primitive like a string, number, boolean, null, etc.,
	 * or an array or object of such values.
	 * @returns A React component in case of a page element, the primitive in case of a primitive,
	 * or an array or object with values converted in the same manner, if an array resp. object is provided.
	 */
	private createComponent(value: PropertyValue, key?: string): JSX.Element | PropertyValue {
		if (value === undefined || value === null || typeof value !== 'object') {
			// Primitives stay primitives.
			return value;
		}

		if (value instanceof PageElement) {
			// The model is a page element, create a React pattern component

			// First, process the properties and children of the declaration recursively
			const pageElement: PageElement = value;
			if (!pageElement.getPattern()) {
				return null;
			}

			const pattern: Pattern = pageElement.getPattern() as Pattern;
			if (pattern instanceof TextPattern) {
				return pageElement.getPropertyValue('text');
			}

			// tslint:disable-next-line:no-any
			const componentProps: any = {};
			pattern.getProperties().forEach(property => {
				componentProps[property.getId()] = this.createComponent(
					property.convertToRender(pageElement.getPropertyValue(property.getId())),
					property.getId()
				);
			});

			componentProps.children = pageElement
				.getChildren()
				.map((child, index) => this.createComponent(child, String(index)));

			// Then, load the pattern factory
			const patternPath: string = pattern.getAbsolutePath();
			let patternFactory: React.StatelessComponent = this.patternFactories[patternPath];
			if (patternFactory == null) {
				// tslint:disable-line
				patternFactory = require(patternPath).default;
				this.patternFactories[patternPath] = patternFactory;
			}
			const reactComponent = patternFactory(componentProps);

			// Finally, build the component
			if (
				pageElement.getId().toString() ===
				(this.props.selectedElementId && this.props.selectedElementId.toString())
			) {
				return (
					<PatternWrapper
						key={key}
						ref={(el: PatternWrapper) => {
							const domNode = ReactDOM.findDOMNode(el);
							if (!domNode) {
								return;
							}

							const highlightArea: HighlightAreaProps = this.state.highlightArea;
							const clientRect: ClientRect = domNode.getBoundingClientRect();
							const newHighlightArea: HighlightAreaProps = {
								bottom: clientRect.bottom,
								height: clientRect.height,
								left: clientRect.left + window.scrollX,
								opacity: 1,
								right: clientRect.right,
								top: clientRect.top + window.scrollY,
								width: clientRect.width
							};

							if (
								newHighlightArea.top === highlightArea.top &&
								newHighlightArea.right === highlightArea.right &&
								newHighlightArea.bottom === highlightArea.bottom &&
								newHighlightArea.left === highlightArea.left &&
								newHighlightArea.height === highlightArea.height &&
								newHighlightArea.width === highlightArea.width
							) {
								return;
							}

							domNode.scrollIntoView({
								behavior: 'smooth',
								block: 'center',
								inline: 'nearest'
							});
							this.setState({ highlightArea: newHighlightArea });
						}}
					>
						{reactComponent}
					</PatternWrapper>
				);
			}
			return <PatternWrapper key={key}>{reactComponent}</PatternWrapper>;
		} else {
			// The model is an object, but not a pattern declaration.
			// Create a new object with recursively processed values.

			// tslint:disable-next-line:no-any
			const result: any = {};
			Object.keys(value).forEach(objectKey => {
				// tslint:disable-next-line:no-any
				result[objectKey] = this.createComponent((value as any)[objectKey]);
			});
			return result;
		}
	}
}

interface PatternWrapperState {
	errorMessage?: string;
}
