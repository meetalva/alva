import { IconName } from '../components';

export enum PatternPropertyType {
	Asset = 'asset',
	Boolean = 'boolean',
	Enum = 'enum',
	EventHandler = 'EventHandler',
	Href = 'href',
	NumberArray = 'number[]',
	Number = 'number',
	StringArray = 'string[]',
	String = 'string'
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
	| 'string';

export enum PatternPropertyOrigin {
	BuiltIn = 'built-in',
	UserProvided = 'user-provided'
}

export type SerializedPatternPropertyOrigin = 'built-in' | 'user-provided';

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
	| SerializedStringProperty
	| SerializedHrefProperty;

export interface SerializedPropertyBase {
	contextId: string;
	description: string;
	example: string;
	hidden: boolean;
	id: string;
	inputType: PatternPropertyInputType;
	label: string;
	origin: SerializedPatternPropertyOrigin;
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

export interface SerializedPatternEnumProperty extends SerializedPropertyBase {
	defaultOptionId?: string;
	options: SerializedEnumOption[];
	type: 'enum';
}

export interface SerializedEnumOption {
	contextId: string;
	icon: IconName | undefined;
	id: string;
	name: string;
	ordinal: string;
	value: string | number;
}

export enum PatternEventType {
	ChangeEvent,
	MouseEvent
}

export type SerializedPatternEventType = 'ChangeEvent' | 'MouseEvent';

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

export interface SerializedStringProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'string';
}

export interface SerializedHrefProperty extends SerializedPropertyBase {
	defaultValue?: string;
	type: 'href';
}
