import { Color } from '../colors';
import { Icon, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';
import { ChevronRight } from 'react-feather';

const ReactSelect = require('react-select').default;

const StyledChevron = styled(ChevronRight)`
	color: ${Color.Black};
	fill: ${Color.Grey60};
	stroke: none;
	width: ${IconSize.XS}px;
	height: ${IconSize.XS}px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.XS)}px;
	transform: rotate(90deg);
`;

// tslint:disable-next-line:no-empty
const NOOP = () => {};

export const ChevronIcon: React.SFC = props => <StyledChevron {...props} />;

export interface SelectProps {
	autoFocus?: boolean;
	components?: {
		IndicatorsContainer?: React.SFC | React.ComponentClass;
		Option?: React.SFC | React.ComponentClass;
		Placeholder?: React.SFC | React.ComponentClass;
		Control?: React.SFC | React.ComponentClass;
	};
	controlShouldRenderValue?: boolean;
	isMulti?: boolean;
	isSearchable?: boolean;
	menuIsOpen?: boolean;
	menuPosition?: 'absolute' | 'fixed';
	options: SelectOption[];
	placeholder?: string;
	// tslint:disable-next-line:no-any
	styles?: { [key: string]: any };
	value: SelectOption | SelectOption[] | undefined;
	onBlur?(e: React.ChangeEvent<HTMLElement>): void;
	onChange?(item: SimpleSelectOption | SimpleSelectOption[]): void;
	onFocus?(): void;
	onInputChange?(e: React.ChangeEvent<HTMLElement>): void;
	onMenuOpen?(): void;
	onMenuClose?(): void;
}

export type SelectOption = SimpleSelectOption | SelectOptionGroup;

export interface SelectOptionGroup {
	label: string;
	options: SimpleSelectOption[];
}

export interface SimpleSelectOption {
	label: string;
	value: string;
	selected?: boolean;
}

export const Select: React.StatelessComponent<SelectProps> = props => (
	<ReactSelect
		controlShouldRenderValue={props.controlShouldRenderValue}
		isMulti={props.isMulti}
		isSearchable={props.isSearchable}
		components={{
			IndicatorsContainer: StyledChevron,
			...(props.components || {})
		}}
		menuIsOpen={props.menuIsOpen}
		menuPosition={props.menuPosition}
		options={props.options}
		onBlur={props.onBlur || NOOP}
		onChange={props.onChange || NOOP}
		onFocus={props.onFocus || NOOP}
		onInputChange={props.onInputChange || NOOP}
		onMenuClose={props.onMenuClose || NOOP}
		onMenuOpen={props.onMenuOpen || NOOP}
		placeholder={props.placeholder}
		value={props.value}
		styles={{
			container: (base: any, state: any) => ({
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
			input: (base: any) => ({
				...base,
				marginRight: '-3px'
			}),
			menu: (base: any) => ({
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
			menuList: (base: any) => ({
				...base,
				padding: 0
			}),
			option: () => ({
				background: Color.White,
				color: Color.Grey20,
				fontSize: '15px',
				padding: '6px 12px 6px 9px'
			}),
			valueContainer: (base: any) => ({
				...base,
				padding: '6px 12px 6px 9px',
				color: Color.Grey20
			}),
			placeholder: (base: any) => ({
				...base,
				color: Color.Grey20,
				margin: 0,
				whiteSpace: 'nowrap',
				textOverflow: 'ellipsis',
				overflow: 'hidden'
			}),
			...(props.styles || {})
		}}
	/>
);
