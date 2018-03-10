import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Page } from '../../store/page/page';
import { PageElement } from '../../store/page/page-element';
import { PropertyValue } from '../../store/page/property-value';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

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

@observer
export class Preview extends React.Component<PreviewProps> {
	private patternFactories: { [id: string]: React.StatelessComponent | ObjectConstructor };
	@observable private highlightArea: HighlightAreaProps;

	public constructor(props: PreviewProps) {
		super(props);
		this.patternFactories = {};

		this.highlightArea = {
			bottom: 0,
			height: 0,
			left: 0,
			opacity: 0,
			right: 0,
			top: 0,
			width: 0
		};
	}

	public render(): JSX.Element | null {
		if (this.props.page) {
			const highlightArea: HighlightAreaProps = this.highlightArea;
			return (
				<>
					{this.createComponent(this.props.page.getRoot()) as JSX.Element}
					<div
						style={{
							position: 'absolute',
							boxSizing: 'border-box',
							border: '1px dashed rgba(55, 55, 55, .5)',
							background:
								'repeating-linear-gradient(135deg,transparent,transparent 2.5px,rgba(51,141,222, .5) 2.5px,rgba(51,141,222, .5) 5px), rgba(102,169,230, .5)',
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
			const pattern = pageElement.getPattern();

			if (!pattern) {
				return null;
			}

			const patternId: string = pattern.getId();
			const patternType: string = pattern.getType();

			if (patternType === 'synthetic') {
				switch (patternId) {
					case 'text':
						return pageElement.getPropertyValue('text');
					default:
						throw new Error(`Unsupported synthetic pattern '${patternId}'`);
				}
			}

			// tslint:disable-next-line:no-any
			const componentProps: any = {};
			pattern.getProperties().forEach(property => {
				const propertyId = property.getId();

				componentProps[propertyId] = this.createComponent(
					property.convertToRender(pageElement.getPropertyValue(propertyId)),
					propertyId
				);
			});

			componentProps.children = pageElement
				.getChildren()
				.map((child, index) => this.createComponent(child, String(index)));

			if (patternType !== 'react') {
				throw new Error(`Unsupported pattern type '${patternType}'`);
			}

			// Then, load the pattern factory
			const patternPath: string = pattern.getImplementationPath();
			let patternFactory: React.StatelessComponent | ObjectConstructor = this.patternFactories[
				patternId
			];
			if (patternFactory == null) {
				const exportName = pattern.getExportName();
				const module = require(patternPath);
				patternFactory = module[exportName];
				this.patternFactories[patternId] = patternFactory;
			}

			const reactComponent = React.createElement(patternFactory, componentProps);

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

							this.highlightElement(domNode);
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

	@action
	private highlightElement(element: Element): void {
		const highlightArea: HighlightAreaProps = this.highlightArea;
		const clientRect: ClientRect = element.getBoundingClientRect();
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

		element.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest'
		});

		this.highlightArea = newHighlightArea;

		setTimeout(() => this.hideHighlightArea(), 500);
	}

	@action
	private hideHighlightArea(): void {
		this.highlightArea.opacity = 0;
	}
}

interface PatternWrapperState {
	errorMessage?: string;
}
