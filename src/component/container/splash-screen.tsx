import Button, { Order } from '../../lsg/patterns/button';
import { colors } from '../../lsg/patterns/colors';
import Copy, { Size as CopySize } from '../../lsg/patterns/copy';
import { Headline } from '../../lsg/patterns/headline';
import Link from '../../lsg/patterns/link';
import * as React from 'react';
import Space, { Size as SpaceSize } from '../../lsg/patterns/space';
// tslint:disable-next-line
import SplashScreenContainer from '../../lsg/patterns/splash-screen';

export interface SplashScreenProps {
	onPrimaryButtonClick?: React.MouseEventHandler<HTMLElement>;
	onSecondaryButtonClick?: React.MouseEventHandler<HTMLElement>;
}

export function SplashScreen(props: SplashScreenProps): JSX.Element {
	return (
		<SplashScreenContainer>
			<Space sizeBottom={SpaceSize.L}>
				<Headline textColor={colors.grey20} order={2}>
					Getting started with Alva
				</Headline>
			</Space>
			<Space sizeBottom={SpaceSize.XXXL}>
				<Copy size={CopySize.M} textColor={colors.grey20}>
					You can open an existing Alva space or create a new one based on our designkit
					including some basic components to kickstart your project.
				</Copy>
			</Space>
			<Space sizeBottom={SpaceSize.S}>
				<Button handleClick={props.onPrimaryButtonClick} order={Order.Primary}>
					Create new Alva space
				</Button>
			</Space>
			<Link color={colors.grey50} onClick={props.onSecondaryButtonClick}>
				<Copy size={CopySize.S}>or open existing Alva space</Copy>
			</Link>
		</SplashScreenContainer>
	);
}
