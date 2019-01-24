import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import { ButtonSize, LibraryBoxState } from '../components';
import { LibraryStoreItem } from '../model/library-store-item';
import { Match, MatchBranch } from './match';
import { PatternLibraryInstallType } from '../types';

export interface LibraryStoreItemContainerProps {
	item: LibraryStoreItem;
}

interface ActiveButtonProps {
	label: string;
	onClick: React.MouseEventHandler;
}

interface DisabledButtonProps {
	label: string;
}

const ActiveButton: React.SFC<ActiveButtonProps> = props => {
	return (
		<Components.Button
			size={ButtonSize.Medium}
			inverted
			color={Components.Color.Grey50}
			onClick={props.onClick}
		>
			{props.label}
		</Components.Button>
	);
};

const DisabledButton: React.SFC<DisabledButtonProps> = props => {
	return (
		<Components.Button
			order={Components.ButtonOrder.Secondary}
			size={ButtonSize.Medium}
			color={Components.Color.White}
			disabled
		>
			{props.label}
		</Components.Button>
	);
};

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryStoreItemContainer extends React.Component<LibraryStoreItemContainerProps> {
	private handleButtonClick = () => {
		const props = this.props as LibraryStoreItemContainerProps & WithStore;

		props.item.connect(props.store.getApp(), {
			project: props.store.getProject()
		});
	};

	public render(): JSX.Element {
		const props = this.props as LibraryStoreItemContainerProps & WithStore;

		const installed = (state: Model.LibraryStoreItemState) =>
			state === Model.LibraryStoreItemState.Installed;

		// TODO: Model "up to date" on library
		const upToDate = (state: Model.LibraryStoreItemState) =>
			state === Model.LibraryStoreItemState.Installed;

		const installing = (state: Model.LibraryStoreItemState) =>
			state === Model.LibraryStoreItemState.Installing;

		const whenHasLibraryAnd = (and: (state: Model.LibraryStoreItemState) => boolean) => (
			state: Model.LibraryStoreItemState
		) => props.item.hasLibrary && and(state);

		const whenNotHasLibraryAnd = (and: (state: Model.LibraryStoreItemState) => boolean) => (
			state: Model.LibraryStoreItemState
		) => !props.item.hasLibrary && and(state);

		const whenRemoteAnd = (and: (state: Model.LibraryStoreItemState) => boolean) => (
			state: Model.LibraryStoreItemState
		) => props.item.installType === PatternLibraryInstallType.Remote && and(state);

		const whenNotRemoteAnd = (and: (state: Model.LibraryStoreItemState) => boolean) => (
			state: Model.LibraryStoreItemState
		) => props.item.installType !== PatternLibraryInstallType.Remote && and(state);

		const boxState =
			props.item.state === Model.LibraryStoreItemState.Installing
				? LibraryBoxState.Progress
				: LibraryBoxState.Idle;

		return (
			<Components.LibraryBox
				key={props.item.id}
				name={props.item.name}
				description={props.item.description}
				state={boxState}
				color={props.item.color}
				image={props.item.image}
				version={props.item.version}
				install={
					<div>
						<Match value={props.item.state}>
							<MatchBranch when={Model.LibraryStoreItemState.Listed}>
								<ActiveButton label="Install" onClick={this.handleButtonClick} />
							</MatchBranch>
							<MatchBranch when={whenHasLibraryAnd(installing)}>
								<DisabledButton label="Updating …" />
							</MatchBranch>
							<MatchBranch when={whenNotHasLibraryAnd(installing)}>
								<DisabledButton label="Installing …" />
							</MatchBranch>
							<MatchBranch when={whenNotRemoteAnd(installed)}>
								<ActiveButton label="Update from Disk" onClick={this.handleButtonClick} />
							</MatchBranch>
							<MatchBranch when={whenRemoteAnd(upToDate)}>
								<DisabledButton label="Up to Date" />
							</MatchBranch>
						</Match>
					</div>
				}
			/>
		);
	}
}
