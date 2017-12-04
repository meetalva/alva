import { ElementValue } from '../../store/page/element_value';
import { observer } from 'mobx-react';
import { Page } from '../../store/page';
import { PageElement } from '../../store/page/page_element';
import * as path from 'path';
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
		const page: Page | undefined = this.props.store.currentPage;
		return this.createComponent(page ? page.root : undefined) as JSX.Element;
	}

	/**
	 * Converts a JSON-serializable declaration of a pattern, primitive, or collection
	 * into a React component (or primitive), deep-traversing through properties and children.
	 * @param value The value, may be a page element object with 'patternSrc' property (a pattern declaration),
	 * a primitive like a string, number, boolean, null, etc.,
	 * or an array or object of such values.
	 * @returns A React component in case of a pattern declaration, the primitive in case of a primitive,
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

		// tslint:disable-next-line:no-any
		const valueAsAny: any = value as any;

		if (valueAsAny['_type'] === 'pattern') {
			// The model is a pattern declaration, create a React pattern component

			// First, process the properties and children of the declaration recursively
			const pageElement: PageElement = value as PageElement;

			// tslint:disable-next-line:no-any
			const componentProps: any = this.createComponent(pageElement.properties) || {};
			componentProps.children = this.createComponent(pageElement.children);

			// Then, load the pattern factory
			const patternFolder: string = path.join(
				this.props.store.styleGuidePath,
				'lib',
				'patterns',
				pageElement.patternSrc || ''
			);
			const patternSrc: string = path.join(patternFolder, 'index.js');
			let patternFactory: React.StatelessComponent = this.patternFactories[patternFolder];
			if (patternFactory == null) {
				console.log(`Loading pattern "${patternSrc}"...`);
				patternFactory = require(patternSrc).default;
				this.patternFactories[patternFolder] = patternFactory;
			}

			// Finally, build the component
			return patternFactory(componentProps);
		} else {
			// The model is an object, but not a pattern declaration.
			// Create a new object with recursively processed values.

			// tslint:disable-next-line:no-any
			const result: any = {};
			Object.keys(value).forEach(objectKey => {
				result[objectKey] = this.createComponent(valueAsAny[objectKey]);
			});
			return result;
		}
	}
}
