import * as C from '../components';
import * as React from 'react';
import { RecentFilesList } from './recent-files-list';
import { GitHub, Mail, Link, MessageSquare } from 'react-feather';

export interface SplashScreenProps {
	onCreateClick?: React.MouseEventHandler<HTMLElement>;
	onOpenClick?: React.MouseEventHandler<HTMLElement>;
	onGuideClick?: React.MouseEventHandler<HTMLElement>;
	onExampleClick?: React.MouseEventHandler<HTMLElement>;
	onGithubClick?: React.MouseEventHandler<HTMLElement>;
	onChatClick?: React.MouseEventHandler<HTMLElement>;
	onWebsiteClick?: React.MouseEventHandler<HTMLElement>;
	onMailClick?: React.MouseEventHandler<HTMLElement>;
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
							description="Start with our easy-to-learn guides"
							color={C.Color.Blue20}
							size={C.TeaserSize.Medium}
							onClick={props.onGuideClick}
							icon="ExternalLink"
						/>
						<C.Teaser
							headline="Download Example"
							description="Download our website as an Alva file"
							color={C.Color.Grey20}
							size={C.TeaserSize.Medium}
							onClick={props.onExampleClick}
							icon="ExternalLink"
						/>
					</C.TeaserRow>
					<C.Space sizeBottom={C.SpaceSize.XL} />
					<C.Layout direction={C.LayoutDirection.Row} style={{ justifyContent: 'center' }}>
						<C.Link onClick={props.onGithubClick} title="Alva on GitHub">
							<GitHub color={C.Color.Grey60} size={C.IconSize.S} strokeWidth={2} />
						</C.Link>
						<C.Space sizeRight={C.SpaceSize.M} />
						<C.Link onClick={props.onChatClick} title="Chat with us">
							<MessageSquare color={C.Color.Grey60} size={C.IconSize.S} strokeWidth={2} />
						</C.Link>
						<C.Space sizeRight={C.SpaceSize.M} />
						<C.Link onClick={props.onWebsiteClick} title="Our Website">
							<Link color={C.Color.Grey60} size={C.IconSize.S} strokeWidth={2} />
						</C.Link>
						<C.Space sizeRight={C.SpaceSize.M} />
						<C.Link onClick={props.onMailClick} title="Write us">
							<Mail color={C.Color.Grey60} size={C.IconSize.S} strokeWidth={2} />
						</C.Link>
					</C.Layout>
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
