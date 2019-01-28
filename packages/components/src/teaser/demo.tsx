import { Teaser, TeaserSize } from '.';
import DemoContainer from '../demo-container';
import * as React from 'react';
import { Color } from '../colors';

export default function TeaserDemo(): JSX.Element {
	return (
		<DemoContainer title="Teaser">
			<Teaser
				headline="Essentials"
				description="Lorem ipsum doloret"
				color={Color.Red}
				size={TeaserSize.Medium}
			/>
		</DemoContainer>
	);
}
