import * as M from '../message';
import * as T from '../types';

export function openWindow({ host, location }: T.MatcherContext): T.Matcher<M.OpenWindow> {
	return async message => {
		switch (message.payload.view) {
			case T.AlvaView.PageDetail:
				await host.createWindow(`${location.origin}/project/${message.payload.projectId}`);
				return;
			case T.AlvaView.SplashScreen:
				await host.createWindow(location.origin);
				return;
		}
	};
}
