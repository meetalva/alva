import * as React from 'react';

enum TestStringEnum {
	/** @name I */
	One,
	/** @name II */
	Two
}

export interface Props {
	thing: TestStringEnum;
}

export const Component: React.SFC<Props> = () => null;
