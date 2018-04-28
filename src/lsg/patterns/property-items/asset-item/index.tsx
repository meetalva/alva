import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

export interface AssetItemProps {
	className?: string;
	handleChooseClick?: React.MouseEventHandler<HTMLElement>;
	handleInputChange?: React.ChangeEventHandler<HTMLInputElement>;
	imageSrc?: string;
	inputValue?: string;
	label: string;
}

const StyledAssetItem = styled.div`
	width: 100%;
	display: flex;
	align-content: center;
	justify-content: space-between;
	margin-bottom: ${getSpace(Size.M)}px;
`;

const StyledLabel = styled.span`
	display: inline-block;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey50.toString()};
	padding: ${getSpace(Size.XS) + getSpace(Size.XXS)}px 0 0;
	width: 30%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis
	user-select: none;
	cursor: default;
`;

const StyledPreview = styled.div`
	width: 70%;
	height: 30px;
	box-sizing: border-box;
	border: 0.5px solid ${colors.grey90.toString()};
	border-radius: 3px;
	display: flex;
	user-select: none;
	cursor: default;
`;

const StyledImageBox = styled.div`
	box-sizing: border-box;
	border-radius: 3px;
	width: 42px;
	height: 100%;
	background-color: ${colors.white.toString()};
	border-right: 0.5px solid ${colors.grey90.toString()};
	padding: 3px;
	flex-shrink: 0;
	vertical-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledImage = styled.img`
	display: inline-block;
	max-width: 100%;
	max-height: 100%;
`;

const StyledButton = styled.div`
	width: 100%;
	padding: ${getSpace(Size.XS)}px ${getSpace(Size.S)}px;

	color: ${colors.grey50.toString()};

	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;

	transition: all ease-in-out 0.1s;

	&:hover {
		color: ${colors.black.toString()};
	}
`;

const StyledInput = styled.input`
	display: none;
`;

export const AssetItem: React.StatelessComponent<AssetItemProps> = props => (
	<StyledAssetItem className={props.className}>
		<StyledLabel>{props.label}</StyledLabel>
		<StyledPreview>
			<StyledImageBox>
				<StyledImage src={props.imageSrc} />
			</StyledImageBox>
			<StyledButton onClick={props.handleChooseClick}>Replace</StyledButton>
		</StyledPreview>

		<StyledInput
			onChange={props.handleInputChange}
			type="textarea"
			value={props.inputValue}
			placeholder="Enter external URL"
		/>
	</StyledAssetItem>
);

export default AssetItem;
