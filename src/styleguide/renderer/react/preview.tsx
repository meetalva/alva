import { AssetProperty } from '../../../store/styleguide/property/asset-property';
import { ErrorMessage } from './error-message';
import { HighlightArea } from '../highlight-area';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Page } from '../../../store/page/page';
import { PageElement } from '../../../store/page/page-element';
import { Pattern } from '../../../store/styleguide/pattern';
import { Placeholder } from './placeholder';
import { PropertyValue } from '../../../store/page/property-value';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store } from '../../../store/store';
import { StringProperty } from '../../../store/styleguide/property/string-property';

export interface PreviewAppState {
	page?: Page;
}

interface PreviewProps {
	page?: Page;
	selectedElementId?: string;
}

interface PatternWrapperState {
	errorMessage?: string;
}

interface PatternWrapperProps {
	element: PageElement;
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
					patternName={this.props.element.getName()}
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
	@observable private highlightArea: HighlightArea;
	private patternFactories: { [id: string]: React.StatelessComponent | ObjectConstructor };
	private patternWrapperRef: PatternWrapper;

	public constructor(props: PreviewProps) {
		super(props);
		this.patternFactories = {};

		this.highlightArea = new HighlightArea();
	}

	// tslint:disable-next-line:no-any
	private collectChildren(componentProps: any, pageElement: PageElement): void {
		componentProps.children = pageElement
			.getChildren()
			.map((child, index) => this.createComponent(child));
	}

	// tslint:disable-next-line:no-any
	private collectPropertyValues(componentProps: any, pageElement: PageElement): void {
		const pattern = pageElement.getPattern() as Pattern;
		pattern.getProperties().forEach(property => {
			const propertyId = property.getId();
			componentProps[propertyId] = this.createComponent(
				property.convertToRender(pageElement.getPropertyValue(propertyId))
			);
		});
	}

	public componentDidMount(): void {
		this.triggerHighlight();
	}

	public componentDidUpdate(prevProps: PreviewProps): void {
		this.triggerHighlight();
	}

	private createAssetComponent(pageElement: PageElement): JSX.Element {
		const src = pageElement.getPropertyValue(AssetProperty.SYNTHETIC_ASSET_ID) as string;
		return this.createWrapper(pageElement, <Placeholder src={src} />);
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
	private createComponent(value: PropertyValue): JSX.Element | PropertyValue {
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
					return this.createStringComponent(pageElement);
				} else if (patternId === Pattern.SYNTHETIC_ASSET_ID) {
					return this.createAssetComponent(pageElement);
				}

				// tslint:disable-next-line:no-any
				const componentProps: any = {};
				this.collectPropertyValues(componentProps, pageElement);
				this.collectChildren(componentProps, pageElement);

				// Then, load the pattern factory
				const patternFactory:
					| React.StatelessComponent
					| ObjectConstructor = this.loadAndCachePatternFactory(pattern);

				// Finally, build the component and wrap it for selectability
				const reactElement = React.createElement(patternFactory, componentProps);
				return this.createWrapper(pageElement, reactElement);
			} catch (error) {
				return <ErrorMessage patternName={pageElement.getName()} error={error.toString()} />;
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

	private createStringComponent(pageElement: PageElement): string {
		return String(pageElement.getPropertyValue(StringProperty.SYNTHETIC_TEXT_ID));
	}

	private createWrapper(pageElement: PageElement, reactElement: JSX.Element): JSX.Element {
		return (
			<PatternWrapper
				key={pageElement.getId()}
				element={pageElement}
				ref={
					pageElement.getId() === this.props.selectedElementId
						? (ref: PatternWrapper) => (this.patternWrapperRef = ref)
						: undefined
				}
			>
				{reactElement}
			</PatternWrapper>
		);
	}

	private loadAndCachePatternFactory(
		pattern: Pattern
	): React.StatelessComponent | ObjectConstructor {
		let patternFactory: React.StatelessComponent | ObjectConstructor = this.patternFactories[
			pattern.getId()
		];
		if (patternFactory == null) {
			const patternPath: string = pattern.getImplementationPath();
			const exportName = pattern.getExportName();
			const module = require(patternPath);
			patternFactory = module[exportName];
			this.patternFactories[pattern.getId()] = patternFactory;
		}

		return patternFactory;
	}

	public render(): JSX.Element | null {
		if (this.props.page) {
			const highlightAreaProps = this.highlightArea.getProps();
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
							bottom: highlightAreaProps.bottom,
							height: highlightAreaProps.height,
							left: highlightAreaProps.left,
							opacity: highlightAreaProps.opacity,
							right: highlightAreaProps.right,
							top: highlightAreaProps.top,
							width: highlightAreaProps.width
						}}
					/>
				</>
			);
		}
		return null;
	}

	private triggerHighlight(): void {
		if (this.props.selectedElementId) {
			const domNode = this.patternWrapperRef && ReactDOM.findDOMNode(this.patternWrapperRef);
			if (domNode) {
				this.highlightArea.show(domNode, this.props.selectedElementId);
			}
		} else {
			this.highlightArea.hide();
		}
	}
}

@observer
export class PreviewApp extends React.Component<{}, PreviewAppState> {
	public constructor(props: {}) {
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

		const selectedElement: PageElement | undefined = Store.getInstance().getSelectedElement();
		return (
			<div>
				<Preview
					page={Store.getInstance().getCurrentPage()}
					selectedElementId={selectedElement && selectedElement.getId()}
				/>
				{DevTools ? <DevTools /> : ''}
			</div>
		);
	}
}
