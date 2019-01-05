import { IconName } from '../components';
import { ModelName } from './types';

export enum PatternPropertyType {
	Asset = 'asset',
	Boolean = 'boolean',
	Enum = 'enum',
	EventHandler = 'EventHandler',
	Href = 'href',
	NumberArray = 'number[]',
	Number = 'number',
	StringArray = 'string[]',
	String = 'string',
	Unknown = 'unknown'
}

export type SerializedPatternPropertyType =
	| 'asset'
	| 'boolean'
	| 'enum'
	| 'EventHandler'
	| 'href'
	| 'number[]'
	| 'number'
	| 'string[]'
	| 'string'
	| 'unknown';

export enum PatternPropertyInputType {
	Default = 'default',
	Select = 'select',
	RadioGroup = 'radio-group'
}

export type SerializedPatternPropertyInputType = 'default' | 'select' | 'radio-group';

export type SerializedPatternProperty =
	| SerializedPatternAssetProperty
	| SerializedPatternBooleanProperty
	| SerializedPatternEnumProperty
	| SerializedPatternEventHandlerProperty
	| SerializedPatternNumberArrayProperty
	| SerializedPatternNumberProperty
	| SerializedPatternStringArrayProperty
	| SerializedPatternUnknownProperty
	| SerializedPatternStringProperty
	| SerializedPatternHrefProperty;

export interface SerializedPropertyBase {
	model: ModelName.PatternProperty;
	contextId: string;
	description: string | undefined;
	example: string;
	group: string;
	hidden: boolean;
	id: string;
	inputType: PatternPropertyInputType;
	label: string;
	propertyName: string;
	required: boolean;
	type: SerializedPatternPropertyType;
}

export interface SerializedPatternAssetProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'asset';
}

export interface SerializedPatternBooleanProperty extends SerializedPropertyBase {
	defaultValue?: boolean;
	type: 'boolean';
}

export interface SerializedPatternUnknownProperty extends SerializedPropertyBase {
	defaultValue?: unknown;
	typeText: string;
	type: 'unknown';
}

export interface SerializedPatternEnumProperty extends SerializedPropertyBase {
	defaultOptionId?: string;
	options: SerializedEnumOption[];
	type: 'enum';
}

export interface SerializedEnumOption {
	model: ModelName.PatternEnumPropertyOption;
	contextId: string;
	icon: IconName | undefined;
	id: string;
	name: string;
	ordinal: string;
	value: string | number;
}

export enum PatternEventType {
	Event = 'event',
	InputEvent = 'input-event',
	ChangeEvent = 'change-event',
	FocusEvent = 'focus-event',
	MouseEvent = 'mouse-event'
}

export type SerializedPatternEventType =
	| 'Event'
	| 'InputEvent'
	| 'ChangeEvent'
	| 'FocusEvent'
	| 'MouseEvent';

export type PatternEvent = PatternChangeEvent | PatternMouseEvent;

export interface SerializedPatternEvent {
	type: SerializedPatternEventType;
}

export interface PatternChangeEvent {
	type: PatternEventType.ChangeEvent;
}

export interface PatternMouseEvent {
	type: PatternEventType.MouseEvent;
}

export interface SerializedPatternChangeEvent {
	type: 'ChangeEvent';
}

export interface SerializedPatternMouseEvent {
	type: 'MouseEvent';
}

export interface SerializedPatternEventHandlerProperty extends SerializedPropertyBase {
	event: SerializedPatternEvent;
	type: 'EventHandler';
}

export interface SerializedPatternNumberArrayProperty extends SerializedPropertyBase {
	defaultValue: number[];
	type: 'number[]';
}

export interface SerializedPatternNumberProperty extends SerializedPropertyBase {
	defaultValue?: number;
	type: 'number';
}

export interface SerializedPatternStringArrayProperty extends SerializedPropertyBase {
	defaultValue: string[];
	type: 'string[]';
}

export interface SerializedPatternStringProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'string';
}

export interface SerializedPatternHrefProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'href';
}

export interface PatternLibraryConnections {
	id: string;
	path: string;
}
