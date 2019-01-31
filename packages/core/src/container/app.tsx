import { AppView } from './app-view';
import { ChromeContainer } from './chrome/chrome-container';
import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import * as Types from '@meetalva/types';
import * as Menu from '../menu';
import { ViewStore } from '../store';
import * as ReactLoadable from 'react-loadable';
import { Menu as MenuContainer } from './menu';

const ViewDetails = ReactLoadable({
	loader: () =>
		import(/** webpackChunkName "details", webpackPrefetch true */ './view-details').then(
			m => m.ViewDetails
		),
	loading: () => null
});

const SplashScreenContainer = ReactLoadable({
	loader: () =>
		import(/** webpackChunkName "splash", webpackMode "eager" */ './splash-screen-container').then(
			m => m.SplashScreenContainer
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
							Menu.appMenu(ctx),
							Menu.fileMenu(ctx),
							Menu.editMenu(ctx),
							Menu.viewMenu(ctx),
							Menu.windowMenu(ctx),
							Menu.helpMenu(ctx)
						]}
					/>
				)}
				<ChromeContainer />
				<Components.MainArea>
					<AppView view={Types.AlvaView.SplashScreen}>
						<SplashScreenContainer />
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
