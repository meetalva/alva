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
					<C.Headline bold textColor={C.Color.Grey10} order={1}>
						Meet Alva
					</C.Headline>
					<C.Space sizeBottom={C.SpaceSize.XS} />
					<C.Copy textColor={C.Color.Grey20} size={C.CopySize.M}>
						Create living prototypes with code components.
					</C.Copy>
					<C.Space sizeBottom={C.SpaceSize.XXXL} />
					<C.TeaserRow>
						<C.Teaser
							headline="Get Started"
							description="Start with our easy-to-learn Guides"
							color={C.Color.Blue20}
							size={C.TeaserSize.Medium}
							onClick={props.onGuideClick}
							icon="ExternalLink"
						/>
					</C.TeaserRow>
					<C.Space sizeBottom={C.SpaceSize.XL} />
				</C.SplashScreenSlotLeft>
				<C.SplashScreenSlotRight>
					<RecentFilesList />
				</C.SplashScreenSlotRight>
				<C.SplashScreenSlotBottom>
					<C.ButtonGroup>
						<C.ButtonGroup.ButtonLeft>{props.openFileSlot}</C.ButtonGroup.ButtonLeft>
						<C.ButtonGroup.ButtonRight>
							<C.ButtonGroupButton
								onClick={props.onCreateClick}
								style={{ width: '50%', height: 42 }}
							>
								Create File
							</C.ButtonGroupButton>
						</C.ButtonGroup.ButtonRight>
					</C.ButtonGroup>
				</C.SplashScreenSlotBottom>
			</C.SplashScreen>
		);
	}
}
