import { AppView } from './app-view';
import { ChromeContainer } from './chrome/chrome-container';
import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as Types from '../types';
import * as Menu from '../menu';
import { ViewStore } from '../store';
import * as ReactLoadable from 'react-loadable';

const MenuContainer = ReactLoadable({
	loader: () => import(/** webpackChunkName "menu" */ './menu').then(m => m.Menu),
	loading: () => null
});

const ViewDetails = ReactLoadable({
	loader: () =>
		import(/** webpackChunkName "details", webpackPrefetch true */ './view-details').then(
			m => m.ViewDetails
		),
	loading: () => null
});

const ViewSplashscreen = ReactLoadable({
	loader: () =>
		import(/** webpackChunkName "splash", webpackMode "eager" */ './view-splashscreen').then(
			m => m.ViewSplashscreen
		),
	loading: () => null
});

@MobxReact.inject('store')
@MobxReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as { store: ViewStore };
		const ctx = { app: props.store.getApp(), project: props.store.getProject() };

		const showChrome =
			typeof ctx.project !== 'undefined' &&
			typeof ctx.app !== 'undefined' &&
			ctx.app.isActiveView(Types.AlvaView.PageDetail) &&
			typeof props.store.getActivePage() !== 'undefined';

		return (
			<Components.Layout
				onContextMenu={e => e.preventDefault()}
				direction={Components.LayoutDirection.Column}
				height={Components.LayoutHeight.Full}
			>
				<Components.GlobalStyle />
				{!props.store.getApp().isHostType(Types.HostType.Electron) && (
					<MenuContainer
						variant={Types.MenuVariant.Horizontal}
						menus={[
							// TODO: Connect to store more cleanly
							Menu.appMenu(ctx),
							Menu.fileMenu(ctx),
							Menu.editMenu(ctx),
							Menu.libraryMenu(ctx),
							Menu.viewMenu(ctx),
							Menu.windowMenu(ctx),
							Menu.helpMenu(ctx)
						]}
					/>
				)}
				<ChromeContainer />
				<Components.MainArea>
					<AppView view={Types.AlvaView.SplashScreen}>
						<ViewSplashscreen />
					</AppView>
					<AppView view={Types.AlvaView.PageDetail}>
						<ViewDetails />
					</AppView>
				</Components.MainArea>
				<Components.IconRegistry />
			</Components.Layout>
		);
	}
}
