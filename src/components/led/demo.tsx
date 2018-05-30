import { Led, LedColor } from './led';
import * as React from 'react';

export default function LedDemo(): JSX.Element {
	return (
		<div>
			<Led ledColor={LedColor.Green} />
			<Led ledColor={LedColor.Orange} />
			<Led ledColor={LedColor.Red} />
		</div>
	);
}
