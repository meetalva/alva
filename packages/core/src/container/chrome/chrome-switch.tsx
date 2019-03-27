import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as C from '@meetalva/components';
import { ViewStore } from '../../store';
import * as Types from '@meetalva/types';
import { Check, ChevronDown } from 'react-feather';
import { When } from '../when';
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
		const viewMode = store.getApp().getProjectViewMode();
		const isDesignView = viewMode === Types.ProjectViewMode.Design;

		const app = store.getApp();
		const libraryStore = store.libraryStore;
		const panes = app.getPanes();

		const next = panes.size > 0 ? [] : AppPanes;

		const options = AppPanes.map(pane => ({
			label: getLabel(pane),
			value: pane.toString(),
			selected: panes.has(pane)
		}));

		const value = options.filter(o => o.selected);

		const withOffset =
			typeof navigator !== 'undefined' &&
			navigator.platform === 'MacIntel' &&
			app.isHostType(Types.HostType.Electron);
		const marginLeft = withOffset ? C.getSpace(C.SpaceSize.XXL * 2 + C.SpaceSize.XS) : 0;

		return (
			<C.Flex alignItems={C.FlexAlignItems.Center} style={{ marginLeft, height: '100%' }}>
				<div style={{ minWidth: 52 }}>
					<When isDesignView={isDesignView}>
						<C.LayoutSwitch
							active={!next}
							onPrimaryClick={() => app.setPanes(next)}
							onDoubleClick={event => event.stopPropagation()}
							onSecondaryClick={() => app.setPaneSelectOpen(!app.getPaneSelectOpen())}
						>
							<OutsideClickHandler onOutsideClick={() => app.setPaneSelectOpen(false)}>
								<C.Select
									value={value}
									components={{
										Control: props => (
											<ChevronDown
												size={C.IconSize.XXS}
												style={{ zIndex: 10, pointerEvents: 'none' }}
											/>
										),
										Option: props => (
											<ReactSelectComponents.Option {...props}>
												<C.Flex alignItems={C.FlexAlignItems.Center}>
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
												</C.Flex>
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
										container: (base: any) => ({
											...base,
											display: 'flex',
											zIndex: 20
										}),
										menu: (base: any) => ({
											...base,
											width: 125,
											left: -38,
											overflow: 'hidden',
											zIndex: 2
										}),
										option: () => ({
											padding: '3px 6px'
										})
									}}
								/>
							</OutsideClickHandler>
						</C.LayoutSwitch>
					</When>
				</div>
				<C.Space sizeRight={C.getSpace(C.SpaceSize.M)} />
				<C.Tab
					active={app.getProjectViewMode() === Types.ProjectViewMode.Design}
					onClick={() => app.setProjectViewMode(Types.ProjectViewMode.Design)}
				>
					Design
				</C.Tab>
				<C.Tab
					active={app.getProjectViewMode() === Types.ProjectViewMode.Libraries}
					onClick={() => app.setProjectViewMode(Types.ProjectViewMode.Libraries)}
				>
					Libraries
					{libraryStore.updateCount > 0 && (
						<>
							<C.Space sizeRight={C.SpaceSize.XS} />
							<C.BadgeIcon color={C.Color.Blue20}>{libraryStore.updateCount}</C.BadgeIcon>
						</>
					)}
				</C.Tab>
			</C.Flex>
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
