import * as C from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '@meetalva/model';
import * as React from 'react';
import { WithStore } from '../store';
import { LibraryStoreItem } from '@meetalva/model';
import { Match, MatchBranch } from './match';
import { PatternLibraryInstallType } from '@meetalva/types';
import { MessageType } from '@meetalva/message';
import * as uuid from 'uuid';
import { ArrowRight } from 'react-feather';

export interface LibraryStoreItemContainerProps {
	item: LibraryStoreItem;
	size: LibraryStoreItemSize;
}

export enum LibraryStoreItemSize {
	Hero,
	Featured,
	Default,
	Installed
}

export enum LibraryStoreItemState {
	Default,
	Progress,
	Done
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
			size={C.ButtonSize.Medium}
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
			size={C.ButtonSize.Medium}
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
				? C.LibraryBoxState.Progress
				: C.LibraryBoxState.Idle;

		const boxSize = () => {
			switch (props.size) {
				case LibraryStoreItemSize.Hero:
					return C.LibraryBoxSize.Hero;
				case LibraryStoreItemSize.Featured:
					return C.LibraryBoxSize.Featured;
				case LibraryStoreItemSize.Default:
					return C.LibraryBoxSize.Default;
				case LibraryStoreItemSize.Installed:
					return C.LibraryBoxSize.Installed;
				default:
					return C.LibraryBoxSize.Default;
			}
		};

		return (
			<C.LibraryBox
				key={props.item.id}
				name={props.item.displayName || props.item.name}
				description={props.item.description}
				state={boxState}
				color={props.item.color}
				image={props.item.image}
				version={
					<C.Flex alignItems={C.FlexAlignItems.Center}>
						<C.Copy>{props.item.version}</C.Copy>
						{props.item.updateVersion ? (
							<>
								<C.Space
									style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.5 }}
									as="span"
									sizeLeft={C.SpaceSize.XS}
									sizeRight={C.SpaceSize.XS}
								>
									<ArrowRight size={12} />
								</C.Space>
								<C.Copy>{props.item.updateVersion}</C.Copy>
							</>
						) : null}
					</C.Flex>
				}
				size={boxSize()}
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
							Docs
						</C.LinkIcon>
					)
				}
				install={
					<C.Flex alignItems={C.FlexAlignItems.Center}>
						<Match value={props.item.state}>
							<MatchBranch when={Model.LibraryStoreItemState.Listed}>
								<ActiveButton label="Connect" onClick={this.handleButtonClick} />
							</MatchBranch>
							<MatchBranch when={whenHasLibraryAnd(installing)}>
								<div style={{ height: '28px', display: 'flex', alignItems: 'center' }}>
									<C.Spinner size={C.IconSize.M} />
								</div>
							</MatchBranch>
							<MatchBranch when={whenNotHasLibraryAnd(installing)}>
								<div style={{ height: '28px', display: 'flex', alignItems: 'center' }}>
									<C.Spinner size={C.IconSize.M} />
								</div>
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
