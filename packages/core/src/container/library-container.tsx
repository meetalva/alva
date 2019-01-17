import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import * as Types from '../types';

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
				state={props.library.getState()}
				color="#ffffff"
				textColor={Components.Color.Grey20}
				image="http://zwainhaus.com/artanddesign/landscape_03.jpg"
				version={props.library.getVersion()}
				install={
					<Components.Button
						order={Components.ButtonOrder.Primary}
						size={Components.ButtonSize.Medium}
					>
						Already installed
					</Components.Button>
				}
			/>
		);
	}
}

{
	/*<Components.PropertyBox
	headline={props.library.getName()}
	copy={props.library.getDescription()}
	key={props.library.getId()}
>
	{props.library.getOrigin() === Types.PatternLibraryOrigin.UserProvided && (
		<>


			{ /*
			<LibraryStateIndicator state={props.library.getState()} />
			<Components.PropertyBoxBar>
				<Components.ButtonGroup>
					<Components.ButtonGroup.ButtonRight>
						<>
							{mayUpdate && (
								<Components.ButtonGroupButton
									disabled={
										props.library.getState() ===
										Types.PatternLibraryState.Connecting
									}
									onClick={() => {
										if (
											props.library.getState() ===
											Types.PatternLibraryState.Connecting
										) {
											return;
										}

										props.library.setState(Types.PatternLibraryState.Connecting);
										props.store.updatePatternLibrary(props.library);
									}}
								>
									{props.library.getState() ===
									Types.PatternLibraryState.Connecting
										? 'Updating …'
										: 'Update'}
								</Components.ButtonGroupButton>
							)}
							{!mayUpdate &&
								mayReconnect && (
									<Components.ButtonGroupButton
										disabled={
											props.library.getState() ===
											Types.PatternLibraryState.Connecting
										}
										onClick={() => {
											if (
												props.library.getState() ===
												Types.PatternLibraryState.Connecting
											) {
												return;
											}

											props.library.setState(
												Types.PatternLibraryState.Connecting
											);
											props.store.connectPatternLibrary(props.library);
										}}
									>
										{props.library.getState() ===
										Types.PatternLibraryState.Connecting
											? 'Connecting …'
											: 'Connect'}
									</Components.ButtonGroupButton>
								)}
						</>
					</Components.ButtonGroup.ButtonRight>
				</Components.ButtonGroup>
			</Components.PropertyBoxBar>

		</>
	)}
</Components.PropertyBox>
*/
}
