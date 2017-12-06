import { ElementValue } from '../../store/page/element_value';
import { observer } from 'mobx-react';
import { Page } from '../../store/page';
import { PageElement } from '../../store/page/page_element';
import { Pattern } from '../../store/pattern';
import * as React from 'react';
import { Store } from '../../store';

export interface PreviewProps {
	store: Store;
}

@observer
export class Preview extends React.Component<PreviewProps> {
	private patternFactories: { [folder: string]: React.StatelessComponent };

	public constructor(props: PreviewProps) {
		super(props);
		this.patternFactories = {};
	}

	public render(): JSX.Element {
		const page: Page | undefined = this.props.store.getCurrentPage();
		return this.createComponent(page ? page.getRoot() : undefined) as JSX.Element;
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
	private createComponent(value: ElementValue, key?: string): React.Component | ElementValue {
		if (Array.isArray(value)) {
			const array: (string | number)[] = value;
			// Handle arrays by returning a new array with recursively processed elements.
			return array.map((element: ElementValue, index: number) =>
				this.createComponent(element, String(index))
			);
		}

		if (value === undefined || value === null || typeof value !== 'object') {
			// Primitives stay primitives.
			return value;
		}

		if (value instanceof PageElement) {
			// The model is a page element, create a React pattern component

			// First, process the properties and children of the declaration recursively
			const pageElement: PageElement = value as PageElement;
			if (!pageElement.getPattern()) {
				return null;
			}

			const pattern: Pattern = pageElement.getPattern() as Pattern;

			// tslint:disable-next-line:no-any
			const componentProps: any = {};
			pattern.getProperties().forEach(property => {
				componentProps[property.getId()] = pageElement.getPropertyValue(property.getId());
			});

			componentProps.children = this.createComponent(pageElement.getChildren());

			// Then, load the pattern factory
			const patternPath: string = pattern.getAbsolutePath();
			let patternFactory: React.StatelessComponent = this.patternFactories[patternPath];
			if (patternFactory == null) {
				console.log(`Loading pattern "${patternPath}"...`);
				patternFactory = require(patternPath).default;
				this.patternFactories[patternPath] = patternFactory;
			}

			// Finally, build the component
			return patternFactory(componentProps);
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
