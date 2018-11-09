import * as Components from '../../components';
import * as Message from '../../message';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as uuid from 'uuid';

export interface PropertyItemAssetProps {
	property: Model.ElementProperty;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyItemAsset extends React.Component<PropertyItemAssetProps> {
	public render(): JSX.Element | null {
		const props = this.props as PropertyItemAssetProps & { store: ViewStore };
		const { property } = props;

		const patternProperty = property.getPatternProperty();

		if (!patternProperty) {
			return null;
		}

		const imageSrc = (property.getValue() as string | undefined) || '';
		const inputValue = imageSrc && !imageSrc.startsWith('data:') ? imageSrc : '';
		const inputType =
			imageSrc && imageSrc.startsWith('data:')
				? Components.PropertyItemAssetInputType.File
				: Components.PropertyItemAssetInputType.Url;

		return (
			<Components.PropertyItemAsset
				description={patternProperty.getDescription()}
				label={patternProperty.getLabel()}
				imageSrc={imageSrc}
				inputType={inputType}
				inputValue={inputValue}
				onInputBlur={e => props.store.commit()}
				onInputChange={e => property.setValue(e.target.value)}
				onClearClick={() => {
					property.setValue('');
					props.store.commit();
				}}
				onChooseClick={() => {
					const transactionId = uuid.v4();

					const sender = props.store.getSender();

					sender.match<Message.AssetReadResponse>(
						Message.MessageType.AssetReadResponse,
						message => {
							if (message.id === transactionId) {
								property.setValue(message.payload);
								props.store.commit();
							}
						}
					);

					sender.send({
						id: transactionId,
						payload: undefined,
						type: Message.MessageType.AssetReadRequest
					});
				}}
				placeholder="Or enter URL"
			/>
		);
	}
}
