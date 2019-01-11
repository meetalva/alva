import * as React from 'react';
import { A } from './shared-properties-ab';

export interface C extends A {
	c: string;
}

export const ComponentTwo: React.SFC<C> = () => null;
