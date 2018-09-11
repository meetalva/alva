import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as Components from '../../components';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import { Check, ChevronDown } from 'react-feather';

const ReactSelectComponents = require('react-select').components;
const OutsideClickHandler = require('react-outside-click-handler').default;

const AppPanes = [
	Types.AppPane.PagesPane,
	Types.AppPane.ElementsPane,
	Types.AppPane.PropertiesPane
];

@MobxReact.inject('store')
@MobxReact.observer
export class ChromeSwitch extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as { store: ViewStore };
		const app = store.getApp();
		const panes = app.getPanes();

		const next = panes.size > 0 ? [] : AppPanes;

		const options = AppPanes.map(pane => ({
			label: getLabel(pane),
			value: pane.toString(),
			selected: panes.has(pane)
		}));

		const value = options.filter(o => o.selected);

		return (
			<div style={{ marginLeft: Components.getSpace(Components.SpaceSize.XXL * 2) }}>
				<Components.LayoutSwitch
					active={!next}
					onPrimaryClick={() => app.setPanes(next)}
					onDoubleClick={event => event.stopPropagation()}
					onSecondaryClick={() => app.setPaneSelectOpen(!app.getPaneSelectOpen())}
				>
					<OutsideClickHandler onOutsideClick={() => app.setPaneSelectOpen(false)}>
						<Components.Select
							value={value}
							components={{
								Control: props => (
									<ChevronDown
										size={Components.IconSize.XXS}
										style={{ zIndex: 10, pointerEvents: 'none' }}
									/>
								),
								Option: props => (
									<ReactSelectComponents.Option {...props}>
										<div style={{ display: 'flex', alignItems: 'center' }}>
											<Check
												style={{
													width: 15,
													// tslint:disable-next-line:no-any
													opacity: (props as any).isSelected ? 1 : 0,
													flexShrink: 0,
													paddingRight: 5
												}}
											/>
											{props.children}
										</div>
									</ReactSelectComponents.Option>
								)
							}}
							controlShouldRenderValue={false}
							menuIsOpen={app.getPaneSelectOpen()}
							options={options}
							onChange={raw => {
								const items = Array.isArray(raw) ? raw : [raw];
								items.forEach(item => {
									const pane = getPane(item.value);
									if (pane) {
										app.setPane(pane, !item.selected);
									}
								});
							}}
							styles={{
								container: base => ({
									...base,
									display: 'flex'
								}),
								menu: base => ({
									...base,
									width: 125,
									left: -38,
									overflow: 'hidden'
								}),
								option: base => ({
									padding: '3px 6px'
								})
							}}
						/>
					</OutsideClickHandler>
				</Components.LayoutSwitch>
			</div>
		);
	}
}

function getLabel(pane: Types.AppPane): string {
	switch (pane) {
		case Types.AppPane.ElementsPane:
			return 'Elements';
		case Types.AppPane.PagesPane:
			return 'Pages';
		case Types.AppPane.PropertiesPane:
			return 'Properties';
	}
	return '';
}

function getPane(value: string): Types.AppPane | undefined {
	switch (value) {
		case 'elements-pane':
			return Types.AppPane.ElementsPane;
		case 'pages-pane':
			return Types.AppPane.PagesPane;
		case 'properties-pane':
			return Types.AppPane.PropertiesPane;
	}

	return undefined;
}
