import * as React from 'react';
import { Headline, HeadlineLevel } from './headline';
import * as Types from '../types';

const HeadlineDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<div>
			<Headline level={HeadlineLevel.H1}>Headline Order 1</Headline>
			<Headline level={HeadlineLevel.H2}>Headline Order 2</Headline>
			<Headline level={HeadlineLevel.H3}>Headline Order 3</Headline>
			<Headline level={HeadlineLevel.H1} uppercase>
				Headline Order 1
			</Headline>
			<Headline level={HeadlineLevel.H3} textAlign={Types.TextAlign.Center}>
				Headline Order 3
			</Headline>
		</div>
	);
};

export default HeadlineDemo;
