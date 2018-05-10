import { omit, pick } from 'lodash';
import * as React from 'react';

export interface Tag {
	omit(whitelist: string[]): React.SFC<React.HTMLAttributes<HTMLElement>>;
	pick(blacklist: string[]): React.SFC<React.HTMLAttributes<HTMLElement>>;
}

export function tag(TagName: string): Tag {
	return {
		omit(blacklist: string[]): React.SFC<{}> {
			return props => {
				const p = omit(props, blacklist);
				return <TagName {...p}>{p.children}</TagName>;
			};
		},
		pick(whitelist: string[]): React.SFC<{}> {
			return props => {
				const p = pick(props, whitelist);
				return <TagName {...p}>{p.children}</TagName>;
			};
		}
	};
}
