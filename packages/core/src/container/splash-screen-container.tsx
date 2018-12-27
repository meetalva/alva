import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../store';
import { FileInput } from './file-input';
import { transaction } from 'mobx';

export interface SplashScreenProps {
	transaction: string;
	onCreateClick?: React.MouseEventHandler<HTMLElement>;
	onOpenClick?: React.MouseEventHandler<HTMLElement>;
	onOpenFile?(result: string): void;
	onGuideClick?: React.MouseEventHandler<HTMLElement>;
	onSubmit?: React.FormEventHandler<HTMLElement>;
}

@MobxReact.inject('store')
@MobxReact.observer
export class SplashScreenContainer extends React.Component<SplashScreenProps> {
	public render(): JSX.Element | null {
		const { props } = this;
		const { store } = this.props as SplashScreenProps & { store: ViewStore };
		const app = store.getApp();

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
					<Components.Button
						onClick={props.onGuideClick}
						order={Components.ButtonOrder.Primary}
					>
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
					<form method="GET" target="_blank" noValidate={true} onSubmit={props.onSubmit}>
						<input type="hidden" name="t" value={props.transaction} />
						<Components.Space sizeBottom={Components.SpaceSize.S}>
							<Components.Button
								onClick={props.onCreateClick}
								order={Components.ButtonOrder.Secondary}
							>
								Create New Alva File
							</Components.Button>
						</Components.Space>
						<Components.Link color={Components.Color.Grey50} onClick={props.onOpenClick}>
							<label>
								<Components.Copy size={Components.CopySize.S}>
									Open Existing Alva File
									{!app.hasFileAccess() && (
										<FileInput accept=".alva" onChange={props.onOpenFile} />
									)}
								</Components.Copy>
							</label>
						</Components.Link>
					</form>
				</Components.SplashScreenSection>
			</Components.SplashScreen>
		);
	}
}
