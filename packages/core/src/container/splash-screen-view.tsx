import * as C from '../components';
import * as React from 'react';
import { RecentFilesList } from './recent-files-list';

export interface SplashScreenProps {
	onCreateClick?: React.MouseEventHandler<HTMLElement>;
	onOpenClick?: React.MouseEventHandler<HTMLElement>;
	onGuideClick?: React.MouseEventHandler<HTMLElement>;
	openFileSlot?: React.ReactNode;
}

export class SplashScreenView extends React.Component<SplashScreenProps> {
	public render(): JSX.Element | null {
		const { props } = this;

		return (
			<C.SplashScreen>
				<C.SplashScreenSlotLeft>
					<C.Headline tagName="h1" type="secondary" textColor={C.Color.Grey20} order={2}>
						You’re new here?
					</C.Headline>
					<C.Space sizeBottom={C.SpaceSize.XL} />
					<C.Headline type="primary" tagName="div" order={2}>
						Get started with our easy-to-learn guides.
					</C.Headline>
					<C.Space sizeBottom={C.SpaceSize.XL} />
					<C.Button onClick={props.onGuideClick} order={C.ButtonOrder.Primary}>
						See Guides
					</C.Button>
				</C.SplashScreenSlotLeft>
				<C.SplashScreenSlotRight>
					<RecentFilesList />
				</C.SplashScreenSlotRight>
				<C.SplashScreenSlotBottom>
					<C.ButtonGroup>
						<C.ButtonGroup.ButtonLeft>
							<C.ButtonGroupButton
								onClick={props.onCreateClick}
								style={{ width: '50%', height: 42 }}
							>
								Create File
							</C.ButtonGroupButton>
						</C.ButtonGroup.ButtonLeft>
						<C.ButtonGroup.ButtonRight>{props.openFileSlot}</C.ButtonGroup.ButtonRight>
					</C.ButtonGroup>
				</C.SplashScreenSlotBottom>
			</C.SplashScreen>
		);
	}
}
