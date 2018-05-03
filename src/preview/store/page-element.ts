export interface PageElement {
	contents: {
		[propName: string]: PageElement[];
	};
	exportName: string;
	name: string;
	pattern: string;
	properties: {
		// tslint:disable-next-line:no-any
		[propName: string]: any;
	};
	uuid: string;
}
