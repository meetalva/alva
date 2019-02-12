import * as React from 'react';
import { Section } from './index';
import { Headline, HeadlineLevel } from '../headline';
import { Copy, CopySize } from '../copy';
import { Space, SpaceSize } from '../space';
import { Color } from '../colors';
import { Button, ButtonOrder } from '../button';
import { Layout } from '../layout';

const SectionDemo: React.StatelessComponent<void> = (): JSX.Element => {
	return (
		<Section backgroundColor={Color.Black} textColor={Color.White}>
			<Headline level={HeadlineLevel.H1}>
				Create <u>living prototypes</u> with code components.
			</Headline>
			<Space size={SpaceSize.M} />
			<Layout maxWidth="640px">
				<Copy size={CopySize.Large}>
					Alva lets you to design interactive products based on the same components your
					developers are using for production websites. And guess what – we are entirely open
					source.
				</Copy>
			</Layout>
			<Space size={SpaceSize.L} />
			<Button order={ButtonOrder.Primary} onClick={() => alert('Click!')}>
				Download Beta for macOS
			</Button>
			<Space size={SpaceSize.S} />
			<Copy color={Color.Grey70} size={CopySize.Small}>
				Also available for <u>Windows</u> and <u>Linux</u>
			</Copy>
		</Section>
	);
};

export default SectionDemo;
