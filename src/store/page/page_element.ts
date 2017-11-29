import { ElementValue } from './element_value';

export default class PageElement {
	_type: string;
	patternSrc/* TODO: Does not compile: ?*/: string;
	properties: { [name: string]: ElementValue };
	children: [PageElement];
}
