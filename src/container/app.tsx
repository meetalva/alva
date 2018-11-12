import { AppView } from './app-view';
import { ChromeContainer } from './chrome/chrome-container';
import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewDetails } from './view-details';
import { ViewSplashscreen } from './view-splashscreen';
import * as Types from '../types';
import * as MenuContainer from './menu';
import * as Menu from '../menu';
import { ViewStore } from '../store';

@MobxReact.inject('store')
@MobxReact.observer
export class App extends React.Component {
	public render(): JSX.Element | null {
		const props = this.props as { store: ViewStore };
		const ctx = { app: props.store.getApp(), project: props.store.getProject() };

		return (
			<Components.Layout
				direction={Components.LayoutDirection.Column}
				height={Components.LayoutHeight.Full}
			>
				<Components.GlobalStyle />
				{!props.store.getApp().isHostType(Types.HostType.LocalElectron) && (
					<MenuContainer.Menu
						variant={MenuContainer.MenuVariant.Horizontal}
						menus={[
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
				<Components.MaiArea>
					<AppView view={Types.AlvaView.SplashScreen}>
						<ViewSplashscreen />
					</AppView>
					<AppView view={Types.AlvaView.PageDetail}>
						<ViewDetails />
					</AppView>
				</Components.MaiArea>
				<Components.IconRegistry />
			</Components.Layout>
		);
	}
}
