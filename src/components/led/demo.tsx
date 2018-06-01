import DemoContainer from '../demo-container';
import { Led, LedColor } from './led';
import * as React from 'react';

export default function LedDemo(): JSX.Element {
	return (
		<DemoContainer title="LED">
			<Led ledColor={LedColor.Green} />
			<Led ledColor={LedColor.Orange} />
			<Led ledColor={LedColor.Red} />
		</DemoContainer>
	);
}
