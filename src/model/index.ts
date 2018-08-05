export * from './alva-app';
export * from './edit-history';
export * from './element';
export * from './element-action';
export * from './page';
export * from './pattern-library';
export * from './pattern-property';
export * from './pattern';
export * from './project';
export * from './user-store';
export * from './user-store-action';
export * from './user-store-enhancer';
export * from './user-store-property';
export * from './user-store-reference';

import { AlvaApp } from './alva-app';
import { Element, ElementContent, ElementProperty } from './element';
import { ElementAction } from './element-action';
import { Page } from './page';
import { PatternLibrary } from './pattern-library';
import { Project } from './project';
import { AnyPatternProperty } from './pattern-property';
import { Pattern } from './pattern';
import { UserStore } from './user-store';
import { UserStoreAction } from './user-store-action';
import { UserStoreEnhancer } from './user-store-enhancer';
import { UserStoreProperty } from './user-store-property';
import { UserStoreReference } from './user-store-reference';

export type AnyModel =
	| AlvaApp
	| AnyPatternProperty
	| Element
	| ElementContent
	| ElementAction
	| ElementProperty
	| Page
	| Pattern
	| PatternLibrary
	| Project
	| UserStore
	| UserStoreAction
	| UserStoreEnhancer
	| UserStoreProperty
	| UserStoreReference;
