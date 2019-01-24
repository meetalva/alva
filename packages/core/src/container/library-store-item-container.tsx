import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import { ButtonSize, LibraryBoxState } from '../components';
import { LibraryStoreItem } from '../model/library-store-item';

export interface LibraryStoreItemContainerProps {
	item: LibraryStoreItem;
}

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryStoreItemContainer extends React.Component<LibraryStoreItemContainerProps> {
	public render(): JSX.Element {
		const props = this.props as LibraryStoreItemContainerProps & WithStore;

		const idle = props.item.state === Model.LibraryStoreItemState.Listed;
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
					!installed && (
						<Components.Button
							disabled={installing || installed}
							size={ButtonSize.Medium}
							inverted
							textColor={Components.Color.Grey50}
							onClick={() => {
								if (!idle) {
									return;
								}
							}}
						>
							Install
						</Components.Button>
					)
				}
			/>
		);
	}
}
