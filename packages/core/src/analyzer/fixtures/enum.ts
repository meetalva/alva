import * as React from 'react';

enum TestStringEnum {
	One,
	Two
}

export interface Props {
	thing: TestStringEnum;
}

export const Component: React.SFC<Props> = () => null;
