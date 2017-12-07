import { PageElement } from './page_element';

export type PropertyValue =
	// tslint:disable-next-line:no-any
	| { [id: string]: any }
	| string
	| string[]
	| number
	| number[]
	| boolean
	| PageElement
	| undefined
	| null;
