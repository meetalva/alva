import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
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

const StyledPreview = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
`;

const StyledInput = styled.input`
	display: inline-block;
	box-sizing: border-box;
	max-width: 75%;
	text-overflow: ellipsis;
	border: none;
	border-bottom: 1px solid transparent;
	background: transparent;
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	color: ${colors.grey36.toString()};
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

const StyledImageBox = styled.div`
	box-sizing: border-box;
	border-radius: 3px;
	width: 42px;
	height: 42px;
	background-color: ${colors.white.toString()};
	border: 0.5px solid ${colors.grey90.toString()};
	padding: 3px;
	margin-right: 6px;
	flex-shrink: 0;
`;

const StyledImage = styled.img`
	width: 100%;
`;

const StyledButton = styled.button`
	max-width: 50%;
	margin-right: 3px;
	border: 0.5px solid ${colors.grey90.toString()};
	border-radius: 3px;
	background-color: ${colors.white.toString()};
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.S)}px;
`;

export const AssetItem: React.StatelessComponent<AssetItemProps> = props => (
	<StyledAssetItem className={props.className}>
		<label>
			<StyledLabel>{props.label}</StyledLabel>
			<StyledPreview>
				<StyledImageBox>
					<StyledImage src={props.imageSrc} />
				</StyledImageBox>
				<StyledInput
					onChange={props.handleInputChange}
					type="textarea"
					value={props.inputValue}
					placeholder="Enter external URL"
				/>
			</StyledPreview>
		</label>
		<StyledButton onClick={props.handleChooseClick}>Choose...</StyledButton>
		<StyledButton onClick={props.handleClearClick}>Clear</StyledButton>
	</StyledAssetItem>
);

export default AssetItem;
