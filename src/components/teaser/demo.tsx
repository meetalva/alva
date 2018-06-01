import { Teaser } from '.';
import DemoContainer from '../demo-container';
import * as React from 'react';

export default function TeaserDemo(): JSX.Element {
	return (
		<DemoContainer title="Teaser">
			<Teaser
				headline="A headline to catch attention"
				description="Something describing what the user might want to do"
				primaryButton="Make them click this"
				secondaryButton="Or this"
			/>
		</DemoContainer>
	);
}
