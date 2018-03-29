import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

export interface AssetItemProps {
	className?: string;
	handleChooseClick?: React.MouseEventHandler<HTMLButtonElement>;
	handleClearClick?: React.MouseEventHandler<HTMLButtonElement>;
	handleInputChange?: React.ChangeEventHandler<HTMLInputElement>;
	imageSrc?: string;
	inputValue?: string;
	label: string;
}

const StyledAssetItem = styled.div`
	width: 100%;
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(Size.XS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
`;

const StyledInput = styled.input`
	display: block;
	box-sizing: border-box;
	width: 100%;
	text-overflow: ellipsis;
	border: none;
	border-bottom: 1px solid transparent;
	background: transparent;
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	padding-bottom: ${getSpace(Size.M) / 2}px;
	color: ${colors.grey36.toString()};
	margin-bottom: ${getSpace(Size.L)}px;
	transition: all 0.2s;

	::-webkit-input-placeholder {
		color: ${colors.grey60.toString()};
	}

	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}

	&:focus {
		outline: none;
		border-color: ${colors.blue40.toString()};
		color: ${colors.black.toString()};
	}
`;

const StyledImage = styled.img`
	max-width: 50%;
`;

const StyledButton = styled.button`
	max-width: 50%;
`;

export const AssetItem: React.StatelessComponent<AssetItemProps> = props => (
	<StyledAssetItem className={props.className}>
		<label>
			<StyledLabel>{props.label}</StyledLabel>
			<StyledInput
				onChange={props.handleInputChange}
				type="textarea"
				value={props.inputValue}
				placeholder="Enter external URL"
			/>
			<StyledImage src={props.imageSrc} />
			<StyledButton onClick={props.handleChooseClick}>Choose</StyledButton>
			<StyledButton onClick={props.handleClearClick}>Clear</StyledButton>
		</label>
	</StyledAssetItem>
);

export default AssetItem;
