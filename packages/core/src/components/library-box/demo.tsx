import { Color } from '../colors';
import DemoContainer from '../demo-container';
import { LibraryBox } from './index';
import { Button, ButtonOrder, ButtonSize } from '../button';
import * as React from 'react';
import { PatternLibraryState } from '../../types';

const LibraryBoxDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer>
		<LibraryBox
			color={Color.White}
			textColor={Color.Grey20}
			image="http://zwainhaus.com/artanddesign/landscape_03.jpg"
			name="Wireframe Kit"
			description="Simple wireframing kit to kickstart your product ideas."
			state={PatternLibraryState.Connected}
			install={
				<Button
					order={ButtonOrder.Primary}
					size={ButtonSize.Medium}
					textColor={Color.Grey20}
					inverted
				>
					Already installed
				</Button>
			}
			version="v1"
		/>
	</DemoContainer>
);

export default LibraryBoxDemo;
