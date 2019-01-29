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
import * as M from '../message';

export type AnyModel =
	| AlvaApp<M.Message>
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
