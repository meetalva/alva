import * as React from 'react';

// tslint:disable-next-line:no-any
export const SyntheticLink: React.SFC = (props: any) => (
	<a href={props.href} onClick={props.onClick} target={props.target} rel={props.rel}>
		{props.children}
	</a>
);
