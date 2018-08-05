export type MobxChange =
	| MobxAction
	| MobxScheduledReaction
	| MobxReaction
	| MobxCompute
	// tslint:disable-next-line:no-any
	| MobxUpdate<any, any>
	| MobxSplice
	// tslint:disable-next-line:no-any
	| MobxAdd<any>
	// tslint:disable-next-line:no-any
	| MobxDelete<any>
	// tslint:disable-next-line:no-any
	| MobxCreate<any>
	| MobxReportEnd;

export interface MobxReportStart {
	spyReportStart?: true;
	spyReportEnd?: false;
}

export enum MobxChangeType {
	Action = 'action',
	ScheduledReaction = 'scheduled-reaction',
	Reaction = 'reaction',
	Compute = 'compute',
	Error = 'error',
	Update = 'update',
	Splice = 'splice',
	Add = 'add',
	Delete = 'delete',
	Create = 'create',
	ReportEnd = 'report-end'
}

export interface MobxAction extends MobxReportStart {
	type: MobxChangeType.Action;
	name: string;
	object: unknown;
	arguments: unknown;
}

export interface MobxScheduledReaction extends MobxReportStart {
	type: MobxChangeType.ScheduledReaction;
}

export interface MobxReaction extends MobxReportStart {
	type: MobxChangeType.Reaction;
}

export interface MobxCompute extends MobxReportStart {
	type: MobxChangeType.Compute;
}

export interface MobxSplice<T = unknown> extends MobxReportStart {
	type: MobxChangeType.Splice;
	added: T[];
	addedCount: number;
	name: string;
	object: T[];
	removed: T[];
	removedCount: number;
	index: number;
}

export type MobxAdd<V = unknown, T = unknown> = MobxMapAdd<V, T>;

export interface MobxMapAdd<V, T> extends MobxReportStart {
	object: T;
	key: V;
	name: string;
	newValue: T;
	type: MobxChangeType.Add;
}

export interface MobxDelete<T> extends MobxReportStart {
	object: T;
	name: string;
	oldValue: T;
	type: MobxChangeType.Delete;
}

export interface MobxCreate<T> extends MobxReportStart {
	object: T;
	name: string;
	newValue: T;
	type: MobxChangeType.Create;
}

export type MobxUpdate<V, T> = MobxArrayUpdate<T> | MobxMapUpdate<V, T> | MobxObjectUpdate<T>;

export interface MobxArrayUpdate<T = unknown> extends MobxReportStart {
	type: MobxChangeType.Update;
	object: T[];
	name: string;
	index: number;
	newValue: T;
	oldValue: T;
}

export interface MobxMapUpdate<V = unknown, T = unknown> extends MobxReportStart {
	type: MobxChangeType.Update;
	object: Map<V, T>;
	key: string;
	name: string;
	newValue: T;
	oldValue: T;
}

export interface MobxObjectUpdate<T = unknown> extends MobxReportStart {
	type: MobxChangeType.Update;
	object: T;
	key: string;
	name: string;
	newValue: T;
	oldValue: T;
}

export enum MobxUpdateDataType {
	Array = 'array',
	Map = 'map',
	Object = 'object'
}

export interface MobxReportEnd {
	type?: MobxChangeType.ReportEnd;
	spyReportStart?: false;
	spyReportEnd: true;
}
