import * as C from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import { ButtonSize, LibraryBoxState, LibraryBoxSize } from '@meetalva/components';
import { LibraryStoreItem } from '../model/library-store-item';
import { Match, MatchBranch } from './match';
import { PatternLibraryInstallType } from '../types';
import { MessageType } from '../message';
import * as uuid from 'uuid';
import { ExternalLink } from 'react-feather';

export interface LibraryStoreItemContainerProps {
	item: LibraryStoreItem;
	size: LibraryStoreItemSize;
}

export enum LibraryStoreItemSize {
	Medium,
	Large
}

interface ActiveButtonProps {
	label: string;
	order?: C.ButtonOrder;
	onClick: React.MouseEventHandler;
}

interface DisabledButtonProps {
	label: string;
}

const ActiveButton: React.SFC<ActiveButtonProps> = props => {
	return (
		<C.Button
			order={props.order}
			size={ButtonSize.Medium}
			inverted
			color={C.Color.Grey50}
			onClick={props.onClick}
		>
			{props.label}
		</C.Button>
	);
};

const DisabledButton: React.SFC<DisabledButtonProps> = props => {
	return (
		<C.Button
			order={C.ButtonOrder.Secondary}
			size={ButtonSize.Medium}
			color={C.Color.White}
			disabled
		>
			{props.label}
		</C.Button>
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

		const upToDate = (state: Model.LibraryStoreItemState) =>
			state === Model.LibraryStoreItemState.Installed;

		const needsUpdate = (state: Model.LibraryStoreItemState) =>
			state === Model.LibraryStoreItemState.NeedsUpdate;

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

		const boxSize =
			props.size === LibraryStoreItemSize.Large ? LibraryBoxSize.Large : LibraryBoxSize.Medium;

		return (
			<C.LibraryBox
				key={props.item.id}
				name={props.item.displayName || props.item.name}
				description={props.item.description}
				state={boxState}
				color={props.item.color}
				image={props.item.image}
				version={props.item.version}
				size={boxSize}
				details={
					props.item.homepage && (
						<C.LinkIcon
							icon="ExternalLink"
							size={C.CopySize.S}
							onClick={() =>
								props.store.getApp().send({
									type: MessageType.OpenExternalURL,
									id: uuid.v4(),
									payload: props.item.homepage || ''
								})
							}
						>
							Learn more
						</C.LinkIcon>
					)
				}
				install={
					<C.Flex alignItems={C.FlexAlignItems.Center}>
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
								<C.Space sizeLeft={C.SpaceSize.XS} />
							</MatchBranch>
							<MatchBranch when={whenRemoteAnd(needsUpdate)}>
								<ActiveButton label="Update" onClick={this.handleButtonClick} />
								<C.Space sizeLeft={C.SpaceSize.XS} />
							</MatchBranch>
							<MatchBranch when={whenRemoteAnd(upToDate)}>
								<DisabledButton label="Up to Date" />
								<C.Space sizeLeft={C.SpaceSize.XS} />
							</MatchBranch>
						</Match>
					</C.Flex>
				}
			/>
		);
	}
}
