import * as React from 'react';

export interface Props {
	// tslint:disable-next-line:no-any
	doMethodClickThing(e: React.MouseEvent<any>): void;
}

export const Component: React.SFC<Props> = () => null;
