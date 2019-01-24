import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import * as Types from '../types';
import { ButtonSize, LibraryBoxState } from '../components';

export interface LibrarySettingsContainerProps {
	library: Model.PatternLibrary;
}

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryContainer extends React.Component<LibrarySettingsContainerProps> {
	public render(): JSX.Element {
		const props = this.props as LibrarySettingsContainerProps & WithStore;
		const capabilities = props.library.getCapabilites();

		const mayUpdate =
			capabilities.includes(Types.LibraryCapability.Update) &&
			props.store.getApp().hasFileAccess();

		const mayReconnect =
			capabilities.includes(Types.LibraryCapability.Reconnect) &&
			props.store.getApp().hasFileAccess();

		return (
			<Components.LibraryBox
				key={props.library.getId()}
				name={props.library.getName()}
				description={props.library.getDescription()}
				state={
					props.library.getState() === Types.PatternLibraryState.Connecting
						? LibraryBoxState.Progress
						: LibraryBoxState.Idle
				}
				color={props.library.getColor() || Components.Color.Grey50}
				image={props.library.getImage()}
				version={props.library.getVersion()}
				install={
					mayUpdate ? (
						<Components.Button
							disabled={props.library.getState() === Types.PatternLibraryState.Connecting}
							size={ButtonSize.Medium}
							inverted
							textColor={Components.Color.Grey50}
							onClick={() => {
								if (props.library.getState() === Types.PatternLibraryState.Connecting) {
									return;
								}

								props.library.setState(Types.PatternLibraryState.Connecting);
								props.store.updatePatternLibrary(props.library);
							}}
						>
							{props.library.getState() === Types.PatternLibraryState.Connecting
								? 'Updating …'
								: 'Update'}
						</Components.Button>
					) : (
						mayReconnect && (
							<Components.Button
								disabled={props.library.getState() === Types.PatternLibraryState.Connecting}
								size={ButtonSize.Medium}
								inverted
								textColor={Components.Color.Grey50}
								onClick={() => {
									if (props.library.getState() === Types.PatternLibraryState.Connecting) {
										return;
									}

									props.library.setState(Types.PatternLibraryState.Connecting);
									props.store.connectPatternLibrary(props.library);
								}}
							>
								{props.library.getState() === Types.PatternLibraryState.Connecting
									? 'Connecting …'
									: 'Connect'}
							</Components.Button>
						)
					)
				}
			/>
		);
	}
}
