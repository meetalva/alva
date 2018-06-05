import { Color } from '../colors';
import { Icon, IconName } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

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
	options: CreateSelectOption[];
	placeholder: string;
	value?: CreateSelectOption;
	onChange?(item: CreateSelectOption, action: CreateSelectAction): void;
	onInputChange?(e: React.ChangeEvent<HTMLElement>, action: CreateSelectAction): void;
}

export interface CreateSelectOption {
	label: string;
	value: string;
}

const StyledChevron = styled(Icon).attrs({ name: IconName.ArrowFillRight })`
	color: ${Color.Black};
	fill: ${Color.Grey60};
	width: 12px;
	height: 12px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	transform: rotate(90deg);
	transform: rotate(90deg);
`;

export const CreateSelect: React.SFC<CreateSelectProps> = props => (
	<>
		<CreatableSelect
			components={{
				IndicatorsContainer: StyledChevron
			}}
			options={props.options}
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
					padding: '6px 12px'
				}),
				valueContainer: base => ({
					...base,
					padding: '6px 12px'
				})
			}}
		/>
	</>
);
