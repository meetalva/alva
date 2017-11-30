import { ElementValue } from './element_value';

export class PageElement {
	public _type: string;
	public patternSrc?: string;
	public properties: { [name: string]: ElementValue };
	public children: [PageElement];
}
