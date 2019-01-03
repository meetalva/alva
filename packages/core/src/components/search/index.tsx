import { Color } from '../colors';
import { IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

import { Search as SearchIcon } from 'react-feather';

export interface SearchProps {
	className?: string;
	disabled?: boolean;
	focused?: boolean;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	onClick?: React.MouseEventHandler<HTMLInputElement>;
	onFocus?: React.FocusEventHandler<HTMLInputElement>;
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
	placeholder?: string;
	value?: string | number;
}

const StyledContainer = styled.div`
	position: relative;
	padding: 0 ${getSpace(SpaceSize.M)}px;
`;

const StyledSearch = styled.input`
	/* reset Styles */
	-webkit-appearance: textfield;
	outline: none;
	border: none;
	background: transparent;

	margin-bottom: ${getSpace(SpaceSize.M)}px;
	font-size: 15px;

	box-sizing: border-box;
	display: block;
	width: 100%;
	color: ${Color.Black};
	padding: ${getSpace(SpaceSize.S)}px 0 ${getSpace(SpaceSize.S)}px
		${getSpace(SpaceSize.L) + getSpace(SpaceSize.XXS)}px;

	font-weight: 500;
	transition: color 0.2s;

	::placeholder {
		color: ${Color.Grey50};
		transition: color 0.2s;
		user-select: none;
	}

	:hover {
		::placeholder {
			color: ${Color.Black};
		}
	}

	::-webkit-search-decoration {
		display: none;
	}
`;

const StyledIcon = styled(SearchIcon)`
	position: absolute;
	left: ${getSpace(SpaceSize.M)}px;
	top: ${getSpace(SpaceSize.M) - 1}px; /* fix to propertly align icon */
	pointer-events: none;
`;

export const Search: React.StatelessComponent<SearchProps> = props => (
	<StyledContainer>
		<StyledIcon size={IconSize.XS} color={Color.Grey50} />
		<StyledSearch
			autoFocus={props.focused}
			className={props.className}
			disabled={props.disabled}
			type="search"
			value={props.value}
			onBlur={props.onBlur}
			onFocus={props.onFocus}
			onChange={props.onChange}
			onClick={props.onClick}
			onKeyDown={props.onKeyDown}
			placeholder={props.placeholder}
		/>
	</StyledContainer>
);
