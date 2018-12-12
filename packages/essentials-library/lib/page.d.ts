import * as React from 'react';
export interface PageProps {
	head?: any;
	content?: any;
	children?: React.ReactNode;
}
export declare const Page: React.SFC<PageProps>;
