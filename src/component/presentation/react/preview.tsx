import { ErrorMessage } from './error-message';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import { Page } from '../../../store/page/page';
import { PageElement } from '../../../store/page/page-element';
import { Pattern } from '../../../store/styleguide/pattern';
import { HighlightAreaProps, HighlightElementFunction } from '../../preview';
import { PropertyValue } from '../../../store/page/property-value';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store } from '../../../store/store';
import { StringProperty } from '../../../store/styleguide/property/string-property';

export interface PreviewAppProps {
	highlightElement: HighlightElementFunction;
	store: Store;
}

export interface PreviewAppState {
	page?: Page;
}

interface PreviewProps {
	highlightElement: HighlightElementFunction;
	page?: Page;
	selectedElementId?: string;
}

interface PatternWrapperState {
	errorMessage?: string;
}

interface PatternWrapperProps {
	pattern: Pattern;
}

class PatternWrapper extends React.Component<PatternWrapperProps, PatternWrapperState> {
	public constructor(props: PatternWrapperProps) {
		super(props);
		this.state = {};
	}

	public componentDidCatch(error: Error): void {
		this.setState({ errorMessage: error.message });
	}

	public render(): React.ReactNode {
		if (this.state.errorMessage) {
			return (
				<ErrorMessage
					patternName={this.props.pattern.getName()}
					error={this.state.errorMessage}
				/>
			);
		} else {
			return this.props.children;
		}
	}
}

@observer
class Preview extends React.Component<PreviewProps> {
	@observable private highlightArea: HighlightAreaProps;
	private patternFactories: { [id: string]: React.StatelessComponent | ObjectConstructor };
	private patternWrapperRef: PatternWrapper;

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

		this.highlightElementCallback = this.highlightElementCallback.bind(this);
	}

	public componentDidMount(): void {
		this.triggerHighlight();
	}

	public componentDidUpdate(prevProps: PreviewProps): void {
		if (this.props.selectedElementId) {
			this.triggerHighlight();
		}
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

			try {
				const patternId: string = pattern.getId();
				if (patternId === Pattern.SYNTHETIC_TEXT_ID) {
					return pageElement.getPropertyValue(StringProperty.SYNTHETIC_TEXT_ID);
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

				// Then, load the pattern factory
				const patternPath: string = pattern.getImplementationPath();
				let patternFactory: React.StatelessComponent | ObjectConstructor = this
					.patternFactories[patternId];
				if (patternFactory == null) {
					const exportName = pattern.getExportName();
					const module = require(patternPath);
					patternFactory = module[exportName];
					this.patternFactories[patternId] = patternFactory;
				}

				const reactComponent = React.createElement(patternFactory, componentProps);

				// Finally, build the component
				return (
					<PatternWrapper
						key={key}
						pattern={pattern}
						ref={
							pageElement.getId() === this.props.selectedElementId
								? (ref: PatternWrapper) => (this.patternWrapperRef = ref)
								: undefined
						}
					>
						{reactComponent}
					</PatternWrapper>
				);
			} catch (error) {
				return <ErrorMessage patternName={pattern.getName()} error={error.toString()} />;
			}
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
	private highlightElementCallback(newHighlightArea: HighlightAreaProps): void {
		if (newHighlightArea) {
			this.highlightArea = newHighlightArea;
		}
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

	private triggerHighlight(): void {
		const domNode = this.patternWrapperRef && ReactDOM.findDOMNode(this.patternWrapperRef);
		if (domNode) {
			this.props.highlightElement(domNode, this.highlightArea, this.highlightElementCallback);
		}
	}
}

@observer
export class PreviewApp extends React.Component<PreviewAppProps, PreviewAppState> {
	public constructor(props: PreviewAppProps) {
		super(props);
	}

	public render(): JSX.Element {
		let DevTools;
		try {
			const DevToolsExports = require('mobx-react-devtools');
			DevTools = DevToolsExports ? DevToolsExports.default : undefined;
		} catch (error) {
			// Ignored
		}

		const selectedElement: PageElement | undefined = this.props.store.getSelectedElement();
		return (
			<div>
				<Preview
					page={this.props.store.getCurrentPage()}
					selectedElementId={selectedElement && selectedElement.getId()}
					highlightElement={this.props.highlightElement}
				/>
				{DevTools ? <DevTools /> : ''}
			</div>
		);
	}
}
