import * as React from 'react';
import { Helmet } from 'react-helmet';

// tslint:disable-next-line:no-any
export const SyntheticPage: React.SFC = (props: any) => (
	<div>
		<Helmet>
			<html lang={props.lang} />
			{props.viewport && <meta name="viewport" content="width=device-width, initial-scale=1" />}
			{props.head}
		</Helmet>
		{props.content}
		{props.children}
	</div>
);
