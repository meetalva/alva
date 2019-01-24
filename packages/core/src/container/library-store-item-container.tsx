import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import { ButtonSize, LibraryBoxState } from '../components';
import { LibraryStoreItem } from '../model/library-store-item';
import { Match, MatchBranch } from './match';

export interface LibraryStoreItemContainerProps {
	item: LibraryStoreItem;
}

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryStoreItemContainer extends React.Component<LibraryStoreItemContainerProps> {
	private handleButtonClick = () => {
		const props = this.props as LibraryStoreItemContainerProps & WithStore;
		const idle = props.item.state === Model.LibraryStoreItemState.Listed;

		if (!idle || !props.item.installType) {
			return;
		}

		props.item.connect(props.store.getApp(), {
			project: props.store.getProject()
		});
	};

	public render(): JSX.Element {
		const props = this.props as LibraryStoreItemContainerProps & WithStore;

		const installing = props.item.state === Model.LibraryStoreItemState.Installing;
		const installed = props.item.state === Model.LibraryStoreItemState.Installed;

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
								<Components.Button
									disabled={installing || installed}
									size={ButtonSize.Medium}
									inverted
									color={Components.Color.Grey50}
									onClick={this.handleButtonClick}
								>
									Install
								</Components.Button>
							</MatchBranch>
							<MatchBranch when={Model.LibraryStoreItemState.Installing}>
								<Components.Button
									order={Components.ButtonOrder.Secondary}
									size={ButtonSize.Medium}
									color={Components.Color.White}
									disabled
								>
									Installing …
								</Components.Button>
							</MatchBranch>
							<MatchBranch when={Model.LibraryStoreItemState.Installed}>
								<Components.Button
									order={Components.ButtonOrder.Secondary}
									size={ButtonSize.Medium}
									color={Components.Color.White}
									disabled
								>
									Up to Date
								</Components.Button>
							</MatchBranch>
						</Match>
					</div>
				}
			/>
		);
	}
}
