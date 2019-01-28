import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';

export interface ReferenceProps {
	reference: Model.UserStoreReference;
}

@MobxReact.inject('store')
@MobxReact.observer
export class Reference extends React.Component<ReferenceProps> {
	public render(): JSX.Element | null {
		const props = this.props as ReferenceProps & { store: ViewStore };
		const project = props.store.getProject();
		const store = project.getUserStore();
		const storeProperty = store.getPropertyByReference(props.reference);
		const elementProperty = project.getElementPropertyById(
			props.reference.getElementPropertyId()
		);

		if (!storeProperty || !elementProperty) {
			return null;
		}

		return (
			<Components.PropertyReference
				name={storeProperty.getName()}
				value={String(elementProperty.getValue())}
				onClick={() => props.reference.setOpen(true)}
				onLinkClick={() => {
					store.removeReference(props.reference);
					props.store.commit();
				}}
			/>
		);
	}
}
