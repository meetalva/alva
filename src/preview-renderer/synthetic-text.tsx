import * as React from 'react';

// tslint:disable-next-line:no-any
export const SyntheticText: React.SFC<any> = props => (
	<span style={{ display: 'inline-block' }}>{props.text}</span>
);
