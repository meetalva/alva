import { colors } from '../colors';
import { Icon, IconName, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

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
	color: ${colors.black.toString()};
	padding: ${getSpace(SpaceSize.S)}px 0 ${getSpace(SpaceSize.S)}px
		${getSpace(SpaceSize.L) + getSpace(SpaceSize.XXS)}px;

	font-weight: 500;
	transition: color 0.2s;

	::placeholder {
		color: ${colors.grey50.toString()};
		transition: color 0.2s;
		user-select: none;
	}

	:hover {
		::placeholder {
			color: ${colors.black.toString()};
		}
	}

	::-webkit-search-decoration {
		display: none;
	}
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	left: 0;
	top: ${getSpace(SpaceSize.M) - 1}px; // fix to propertly align icon
	pointer-events: none;
`;

export const Search: React.StatelessComponent<SearchProps> = props => (
	<StyledContainer>
		<StyledIcon name={IconName.Search} size={IconSize.XS} color={colors.grey36} />
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

export default Search;
