import { AssetProperty } from '../../../store/styleguide/property/asset-property';
import * as Chokidar from 'chokidar';
import { ErrorMessage } from './error-message';
import { HighlightArea } from '../highlight-area';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { Page } from '../../../store/page/page';
import { PageElement } from '../../../store/page/page-element';
import * as PathUtils from 'path';
import { Pattern } from '../../../store/styleguide/pattern';
import { PatternComponent } from './pattern-component';
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
	patternFactories: Map<string, React.StatelessComponent | ObjectConstructor>;
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
	@MobX.observable protected highlightArea: HighlightArea;
	protected patternWrapperRef: PatternWrapper;

	public constructor(props: PreviewProps) {
		super(props);
		this.highlightArea = new HighlightArea();
	}

	// tslint:disable-next-line:no-any
	protected collectChildren(componentProps: any, pageElement: PageElement): void {
		componentProps.children = pageElement
			.getChildren()
			.map((child, index) => this.createComponent(child));
	}

	// tslint:disable-next-line:no-any
	protected collectPropertyValues(componentProps: any, pageElement: PageElement): void {
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

	protected createAssetComponent(pageElement: PageElement): JSX.Element {
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
	protected createComponent(value: PropertyValue): JSX.Element | PropertyValue {
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
				} else {
					return this.createPatternComponent(pageElement, patternId);
				}
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

	protected createPatternComponent(pageElement: PageElement, patternId: string): JSX.Element {
		// tslint:disable-next-line:no-any
		const patternProps: any = {};
		this.collectPropertyValues(patternProps, pageElement);
		this.collectChildren(patternProps, pageElement);

		// Then, load the pattern factory
		const patternFactory:
			| React.StatelessComponent
			| ObjectConstructor
			| undefined = this.props.patternFactories.get(patternId);
		if (!patternFactory) {
			throw new Error(`Unknown pattern ID ${patternId}`);
		}

		// Finally, build the component and wrap it for selectability
		const reactElement = (
			<PatternComponent patternFactory={patternFactory} patternProps={patternProps} />
		);
		return this.createWrapper(pageElement, reactElement);
	}

	protected createStringComponent(pageElement: PageElement): string {
		return String(pageElement.getPropertyValue(StringProperty.SYNTHETIC_TEXT_ID));
	}

	protected createWrapper(pageElement: PageElement, reactElement: JSX.Element): JSX.Element {
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
			if (domNode && domNode instanceof Element) {
				this.highlightArea.show(domNode, this.props.selectedElementId);
			}
		} else {
			this.highlightArea.hide();
		}
	}
}

@observer
export class PreviewApp extends React.Component<{}, PreviewAppState> {
	@MobX.observable
	private patternFactories: Map<string, React.StatelessComponent | ObjectConstructor> = new Map();

	private patternReloadScheduled: boolean = false;
	private patternWatcher?: Chokidar.FSWatcher;
	private patternWatcherPath: string | undefined;

	public constructor(props: {}) {
		super(props);
		this.loadAndWatchPatternFactories();
	}

	@MobX.action
	private loadAndWatchPatternFactories(): void {
		this.patternFactories.clear();
		const styleguide = Store.getInstance().getStyleguide();
		if (styleguide) {
			styleguide.getPatterns().forEach(pattern => {
				if (pattern.getId().startsWith('synthetic:')) {
					return;
				}

				try {
					const patternPath: string = pattern.getImplementationPath();
					const exportName = pattern.getExportName();

					// Ensure that require does not cache the implementation,
					// so that we still have control on when we reload it
					delete require.cache[require.resolve(patternPath)];

					const module = require(patternPath);
					this.patternFactories.set(pattern.getId(), module[exportName]);
				} catch (error) {
					console.warn(`Failed to load pattern ${pattern.getId()}: ${error}`);
				}
			});
		}

		const patternWatcherPath = styleguide
			? styleguide
					.getPatternsPath()
					.split(PathUtils.sep)
					.join('/')
			: undefined;

		if (this.patternWatcherPath !== patternWatcherPath) {
			if (this.patternWatcher) {
				this.patternWatcher.close();
				this.patternWatcher = undefined;
			}

			if (patternWatcherPath) {
				const watchPaths = [
					`${patternWatcherPath}/**/index.js`,
					`${patternWatcherPath}/**/index.d.ts`
				];
				this.patternWatcher = Chokidar.watch(watchPaths);
				this.patternWatcher.on('all', (event: string | symbol) => {
					if (this.patternReloadScheduled) {
						return;
					}

					this.patternReloadScheduled = true;
					global.setTimeout(() => {
						this.patternReloadScheduled = false;
						this.loadAndWatchPatternFactories();
					}, 100);
				});
			}

			this.patternWatcherPath = patternWatcherPath;
		}
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
					patternFactories={this.patternFactories}
					selectedElementId={selectedElement && selectedElement.getId()}
				/>
				{DevTools ? <DevTools /> : ''}
			</div>
		);
	}
}
