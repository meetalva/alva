import * as React from 'react';

export interface Props {
	// tslint:disable-next-line:no-any
	doEventHandlerThing: React.EventHandler<React.ChangeEvent<any>>;
}

export const Component: React.SFC<Props> = () => null;
