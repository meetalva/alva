import { Color } from '../colors';
import * as React from 'react';
import { ChevronIcon } from '../select';

const CreatableSelect = require('react-select/lib/Creatable').default;

export type CreateSelectActionType =
	| 'clear'
	| 'create-option'
	| 'deselect-option'
	| 'pop-value'
	| 'remove-value'
	| 'select-option'
	| 'set-value';

export type CreateSelectAction =
	| { action: 'clear' | 'create-option' | 'deselect-option' | 'select-option' | 'set-value' }
	| { action: 'pop-value' | 'remove-value'; removedValue: CreateSelectOption };

export interface CreateSelectProps {
	autoFocus?: boolean;
	menuIsOpen?: boolean;
	options: CreateSelectOption[];
	placeholder: string;
	value?: CreateSelectOption;
	onBlur?(e: React.ChangeEvent<HTMLElement>): void;
	onChange?(item: CreateSelectOption, action: CreateSelectAction): void;
	onInputChange?(e: React.ChangeEvent<HTMLElement>, action: CreateSelectAction): void;
}

export interface CreateSelectOption {
	label: string;
	value: string;
}

export const CreateSelect: React.SFC<CreateSelectProps> = props => (
	<>
		<CreatableSelect
			autoFocus={props.autoFocus}
			backspaceRemovesValue
			components={{
				IndicatorsContainer: ChevronIcon
			}}
			menuIsOpen={props.menuIsOpen}
			options={props.options}
			onBlur={props.onBlur}
			onChange={props.onChange}
			onInputChange={props.onInputChange}
			placeholder={props.placeholder}
			value={props.value}
			styles={{
				container: (base, state) => ({
					...base,
					flexGrow: 1,
					color: state.isFocused ? Color.Blue40 : Color.Grey90,
					boxShadow: `0 0 3px ${state.isFocused ? Color.BlueAlpha40 : 'transparent'}`,
					transition: 'color 0.1s, box-shadow 0.1s',
					':hover': {
						color: state.isFocused ? Color.Blue40 : Color.Grey60
					}
				}),
				control: () => ({
					boxSizing: 'border-box',
					display: 'flex',
					alignItems: 'center',
					background: Color.White,
					borderRadius: 3,
					borderWidth: 1,
					borderColor: 'currentColor',
					borderStyle: 'solid',
					fontSize: '15px',
					height: '30px',
					position: 'relative'
				}),
				input: base => ({
					...base,
					marginRight: '-3px'
				}),
				menu: base => ({
					...base,
					padding: 0,
					borderWidth: 1,
					borderTopWidth: 0,
					borderColor: 'currentColor',
					borderStyle: 'solid',
					borderRadius: '0 0 3px 3px',
					boxShadow: 'none',
					marginTop: '-2px'
				}),
				menuList: base => ({
					...base,
					padding: 0
				}),
				option: base => ({
					background: Color.White,
					color: Color.Grey20,
					fontSize: '15px',
					padding: '6px 12px 6px 9px'
				}),
				valueContainer: base => ({
					...base,
					padding: '6px 12px 6px 9px',
					color: Color.Grey20
				}),
				placeholder: base => ({
					...base,
					color: Color.Grey20,
					margin: 0,
					whiteSpace: 'nowrap',
					textOverflow: 'ellipsis',
					overflow: 'hidden'
				})
			}}
		/>
	</>
);
