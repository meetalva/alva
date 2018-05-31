import {
	Button,
	ButtonOrder,
	colors,
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
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
}

export function SplashScreenContainer(props: SplashScreenProps): JSX.Element {
	return (
		<SplashScreen>
			<Space sizeBottom={SpaceSize.L}>
				<Headline textColor={colors.grey20} order={2}>
					Getting started with Alva
				</Headline>
			</Space>
			<Space sizeBottom={SpaceSize.XXXL}>
				<Copy size={CopySize.M} textColor={colors.grey20}>
					You can open an existing Alva file or create a new one. An .alva file includes the
					connected component library, so you can easily share it with everyone.
				</Copy>
			</Space>
			<Space sizeBottom={SpaceSize.S}>
				<Button onClick={props.onPrimaryButtonClick} order={ButtonOrder.Primary}>
					Create New Alva File
				</Button>
			</Space>
			<Link color={colors.grey50} onClick={props.onSecondaryButtonClick}>
				<Copy size={CopySize.S}>Open Existing Alva File</Copy>
			</Link>
		</SplashScreen>
	);
}
