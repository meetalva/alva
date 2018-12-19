import * as Fuse from 'fuse.js';
import * as Mobx from 'mobx';
import { Pattern } from './pattern';
import * as Types from '../types';

export interface PatternSearchInit {
	patterns: Pattern[];
}

export class PatternSearch {
	@Mobx.observable private fuse: Fuse;

	public constructor(init: PatternSearchInit) {
		this.fuse = new Fuse(init.patterns.map(item => item.toJSON()), {
			keys: ['name', 'description']
		});
	}

	public query(term: string): string[] {
		if (term.trim().length === 0) {
			// tslint:disable-next-line:no-any
			return (this.fuse as any).list.map((item: any) => item.id);
		}
		return this.fuse.search<Types.SerializedPattern>(term).map(match => match.id);
	}
}
