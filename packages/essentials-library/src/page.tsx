import * as React from 'react';
import { Helmet } from 'react-helmet';

export interface PageProps {
	// tslint:disable-next-line:no-any
	head?: any;
	content?: any;
	children?: React.ReactNode;
}

export const Page: React.SFC<PageProps> = props => {
	return (
		<div>
			<Helmet>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{props.head}
			</Helmet>
			{props.content}
			{props.children}
		</div>
	);
};
