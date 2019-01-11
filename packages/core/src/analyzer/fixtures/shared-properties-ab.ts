import * as React from 'react';

export interface A {
	a: string;
}

export interface B extends A {
	b: string;
}

export const ComponentOne: React.SFC<B> = () => null;
