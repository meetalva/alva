import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '@meetalva/types';
import { ActionPayloadSelect } from './action-payload-select';
import { FlexAlignItems } from '@meetalva/components';

export interface ActionInputProps {
	element: Model.Element;
	elementAction: Model.ElementAction;
}

@MobxReact.inject('store')
@MobxReact.observer
export class ActionPayloadInput extends React.Component<ActionInputProps> {
	public render(): JSX.Element | null {
		const props = this.props as ActionInputProps & { store: ViewStore };
		const userProperty = props.elementAction.getStoreProperty();

		if (!userProperty) {
			return null;
		}

		const payloadType = props.elementAction.getPayloadType();

		switch (userProperty.getValueType()) {
			case Types.UserStorePropertyValueType.String:
				return (
					<div
						style={{
							display: 'flex',
							flexWrap: 'nowrap',
							width: '100%',
							marginTop: '6px'
						}}
					>
						<Components.PropertyLabel label="to" />
						{props.elementAction.getOpen() === false &&
							props.elementAction.getPayloadType() ===
								Types.ElementActionPayloadType.String && (
								<div style={{ position: 'relative', flexGrow: 1 }}>
									<Components.PropertyInput
										type={Components.PropertyInputType.Text}
										value={props.elementAction.getPayload()}
										onChange={e => props.elementAction.setPayload(e.target.value)}
										onBlur={() => window.requestIdleCallback(() => props.store.commit())}
									/>
									<Components.PropertyLinkIcon
										onClick={() => {
											props.elementAction.setOpen(true);
										}}
									/>
								</div>
							)}
						{!props.elementAction.getOpen() &&
							props.elementAction.getPayloadType() !==
								Types.ElementActionPayloadType.String && (
								<Components.PropertyReference
									name={getPayloadName(payloadType, {
										element: props.element,
										elementAction: props.elementAction
									})}
									value={getPayloadValue(payloadType, {
										element: props.element,
										elementAction: props.elementAction
									})}
									onClick={() => props.elementAction.setOpen(true)}
									onLinkClick={e => {
										e.stopPropagation();
										props.elementAction.setOpen(false);
										props.elementAction.setPayload('');
										props.elementAction.setPayloadType(
											Types.ElementActionPayloadType.String
										);
										props.store.commit();
									}}
								/>
							)}
						{props.elementAction.getOpen() && (
							<div style={{ position: 'relative', flexGrow: 1 }}>
								<ActionPayloadSelect
									menuIsOpen={props.elementAction.getOpen()}
									elementAction={props.elementAction}
									onChange={raw => {
										const items = Array.isArray(raw) ? raw : [raw];
										items.forEach(item => {
											props.elementAction.setPayload(item.value);
											props.elementAction.setOpen(false);

											const elementProperty = props.store
												.getProject()
												.getElementPropertyById(item.value);

											if (elementProperty) {
												props.elementAction.setPayloadType(
													Types.ElementActionPayloadType.PropertyPayload
												);
											} else {
												props.elementAction.setPayloadType(
													Types.ElementActionPayloadType.EventPayload
												);
											}
										});

										props.store.commit();
									}}
									onOutsideClick={() => {
										props.elementAction.setOpen(false);
									}}
								/>
							</div>
						)}
					</div>
				);
			case Types.UserStorePropertyValueType.Page: {
				const project = props.store.getProject();
				const page = project.getPageById(props.elementAction.getPayload());

				return (
					<Components.Flex
						flexWrap={false}
						alignItems={FlexAlignItems.Center}
						style={{
							marginTop: '6px'
						}}
					>
						<Components.PropertyLabel label="to" />
						<Components.Select
							value={page ? { label: page.getName(), value: page.getId() } : undefined}
							onChange={raw => {
								const items = Array.isArray(raw) ? raw : [raw];
								items.forEach(item => {
									if (props.elementAction) {
										props.elementAction.setPayload(item.value);
										props.store.commit();
									}
								});
							}}
							options={props.store
								.getProject()
								.getPages()
								.map(p => ({ label: p.getName(), value: p.getId() }))}
						/>
					</Components.Flex>
				);
			}
		}

		return null;
	}
}

function getPayloadName(
	payloadType: Types.ElementActionPayloadType,
	ctx: { element: Model.Element; elementAction: Model.ElementAction }
): string | undefined {
	switch (payloadType) {
		case Types.ElementActionPayloadType.EventPayload:
			return `Payload: ${ctx.elementAction.getPayload()}`;
		case Types.ElementActionPayloadType.PropertyPayload:
			const eProperty = ctx.element
				.getProperties()
				.find(p => p.getId() === ctx.elementAction.getPayload());
			const patternProperty = eProperty ? eProperty.getPatternProperty() : undefined;
			return `Property: ${patternProperty ? patternProperty.getLabel() : undefined}`;
		default:
			return undefined;
	}
}

function getPayloadValue(
	payloadType: Types.ElementActionPayloadType,
	ctx: { element: Model.Element; elementAction: Model.ElementAction }
): string | undefined {
	switch (payloadType) {
		case Types.ElementActionPayloadType.PropertyPayload:
			const eProperty = ctx.element
				.getProperties()
				.find(p => p.getId() === ctx.elementAction.getPayload());
			return eProperty ? String(eProperty.getValue()) : '';
		case Types.ElementActionPayloadType.EventPayload:
		default:
			return '';
	}
}
