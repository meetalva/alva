import * as React from 'react';

export interface PropsWithSlots {
	reactNode: React.ReactNode;
	reactNodeArray: React.ReactNode[];
	explicitReactNodeArray: React.ReactNodeArray;
	reactChild: React.ReactChild;
	reactChildArray: React.ReactChild[];
	reactElement: React.ReactElement<any>;
	reactElementArray: React.ReactElement<any>[];
	jsxElement: JSX.Element;
	jsxElementArray: JSX.Element[];
	union: React.ReactChild | React.ReactElement<any> | JSX.Element | string;
	unionArray: (React.ReactChild | React.ReactElement<any> | JSX.Element | string)[];
	disjunct: string | any;
	disjunctArray: string[];
}

export const ReactElement: React.SFC<PropsWithSlots> = () => null;
