import { PageElement } from './page_element';

export type PropertyValue =
	| { [id: string]: PropertyValue }
	| string
	| string[]
	| number
	| number[]
	| boolean
	| PageElement
	| PageElement[]
	| undefined
	| null;
