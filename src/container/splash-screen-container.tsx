import * as Components from '../components';
import * as React from 'react';

export interface SplashScreenProps {
	onCreateClick?: React.MouseEventHandler<HTMLElement>;
	onOpenClick?: React.MouseEventHandler<HTMLElement>;
	onGuideClick?: React.MouseEventHandler<HTMLElement>;
}

export function SplashScreenContainer(props: SplashScreenProps): JSX.Element {
	return (
		<Components.SplashScreen>
			<Components.SplashScreenSection type="primary">
				<Components.Space sizeBottom={Components.SpaceSize.XXL}>
					<Components.Headline
						tagName="h1"
						type="secondary"
						textColor={Components.Color.Grey20}
						order={2}
					>
						You’re new here?
					</Components.Headline>
					<Components.Headline type="primary" tagName="div" order={2}>
						Get started with our easy-to-learn guides.
					</Components.Headline>
				</Components.Space>
				<Components.Button onClick={props.onGuideClick} order={Components.ButtonOrder.Primary}>
					See Guides
				</Components.Button>
			</Components.SplashScreenSection>
			<Components.SplashScreenSection type="secondary">
				<Components.Headline
					type="secondary"
					tagName="h2"
					textColor={Components.Color.Grey20}
					order={3}
				>
					Create or Open
				</Components.Headline>
				<Components.Space sizeBottom={Components.SpaceSize.XXXL}>
					<Components.Copy size={Components.CopySize.M} textColor={Components.Color.Grey20}>
						Start using an existing Alva file with an included library or create a new one.
					</Components.Copy>
				</Components.Space>
				<Components.Space sizeBottom={Components.SpaceSize.S}>
					<Components.Button
						onClick={props.onCreateClick}
						order={Components.ButtonOrder.Secondary}
					>
						Create New Alva File
					</Components.Button>
				</Components.Space>
				<Components.Link color={Components.Color.Grey50} onClick={props.onOpenClick}>
					<Components.Copy size={Components.CopySize.S}>
						Open Existing Alva File
					</Components.Copy>
				</Components.Link>
			</Components.SplashScreenSection>
		</Components.SplashScreen>
	);
}
