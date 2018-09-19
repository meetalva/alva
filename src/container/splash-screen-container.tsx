import {
	Button,
	ButtonOrder,
	Color,
	Copy,
	CopySize,
	Headline,
	Link,
	Space,
	SpaceSize,
	SplashScreen
} from '../components';
import * as React from 'react';

export interface SplashScreenProps {
	onCreateClick?: React.MouseEventHandler<HTMLElement>;
	onOpenClick?: React.MouseEventHandler<HTMLElement>;
	onGuideClick?: React.MouseEventHandler<HTMLElement>;
}

export function SplashScreenContainer(props: SplashScreenProps): JSX.Element {
	return (
		<SplashScreen
			leftSection={
				<>
					<Space sizeBottom={SpaceSize.XXL}>
						<Headline tagName="h1" type="secondary" textColor={Color.Grey20} order={2}>
							You’re new here?
						</Headline>
						<Copy size={CopySize.M}>Get started with our easy-to-learn guides.</Copy>
					</Space>
					<Button onClick={props.onGuideClick} order={ButtonOrder.Primary}>
						See Guides
					</Button>
				</>
			}
			rightSection={
				<>
					<Space sizeBottom={SpaceSize.L}>
						<Headline type="secondary" tagName="h2" textColor={Color.Grey20} order={3}>
							Create or Open
						</Headline>
					</Space>
					<Space sizeBottom={SpaceSize.XXXL}>
						<Copy size={CopySize.M} textColor={Color.Grey20}>
							Start using an existing Alva file with an included library or create a new one.
						</Copy>
					</Space>
					<Space sizeBottom={SpaceSize.S}>
						<Button onClick={props.onCreateClick} order={ButtonOrder.Secondary}>
							Create New Alva File
						</Button>
					</Space>
					<Link color={Color.Grey50} onClick={props.onOpenClick}>
						<Copy size={CopySize.S}>Open Existing Alva File</Copy>
					</Link>
				</>
			}
		/>
	);
}
