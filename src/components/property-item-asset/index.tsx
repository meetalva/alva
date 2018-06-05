import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyItemAssetProps {
	className?: string;
	description?: string;
	imageSrc: string;
	inputType: PropertyItemAssetInputType;
	inputValue?: string;
	label: string;
	onChooseClick?: React.MouseEventHandler<HTMLButtonElement>;
	onClearClick?: React.MouseEventHandler<HTMLButtonElement>;
	onInputBlur?: React.ChangeEventHandler<HTMLInputElement>;
	onInputChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
}

export enum PropertyItemAssetInputType {
	File,
	Url
}

const StyledAssetItemContainer = styled.div`
	width: 100%;
	box-sizing: border-box;
	border-radius: 3px;
	margin-bottom: ${getSpace(SpaceSize.M)}px;
	padding: ${getSpace(SpaceSize.S)}px;
	background: ${Color.White};
	border: 0.5px solid ${Color.Grey90};
`;

const StyledPreview = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
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
	color: ${Color.Grey36};
	transition: all 0.2s;

	::-webkit-input-placeholder {
		color: ${Color.Grey60};
	}

	&:hover {
		color: ${Color.Black};
		border-color: ${Color.Grey60};
	}

	&:focus {
		outline: none;
		border-color: ${Color.Blue40};
		color: ${Color.Black};
	}
`;

const StyledImageBoxContainer = styled.div`
	background-color: ${Color.White};
	border-radius: 3px;
	border: 0.5px solid ${Color.Grey90};
	box-sizing: border-box;
	flex-shrink: 0;
	height: 42px;
	margin-right: 6px;
	padding: 3px;
	width: 42px;
`;

const StyledImageBox = styled.div`
	display: flex;
	box-sizing: border-box;
	overflow: hidden;
	width: 100%;
	height: 100%;
`;

const StyledImage = styled.img`
	width: 100%;
	object-fit: cover;
	object-position: center;
`;

const StyledButton = styled.button`
	max-width: 50%;
	margin-right: 3px;
	border: 0.5px solid ${Color.Grey90};
	border-radius: 3px;
	background-color: ${Color.White};
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.S)}px;
`;

export const PropertyItemAsset: React.StatelessComponent<PropertyItemAssetProps> = props => (
	<StyledAssetItemContainer>
		<StyledPreview>
			<StyledImageBoxContainer>
				<StyledImageBox>
					{props.imageSrc && <StyledImage src={props.imageSrc} />}
				</StyledImageBox>
			</StyledImageBoxContainer>
			{props.inputType === PropertyItemAssetInputType.Url && (
				<StyledInput
					onBlur={props.onInputBlur}
					onChange={props.onInputChange}
					type="textarea"
					value={props.inputValue}
					placeholder={props.placeholder}
				/>
			)}
			{props.inputType === PropertyItemAssetInputType.File && (
				<>
					<StyledButton onClick={props.onChooseClick}>Choose ...</StyledButton>
					<StyledButton disabled={props.imageSrc.length === 0} onClick={props.onClearClick}>
						Clear
					</StyledButton>
				</>
			)}
		</StyledPreview>
		{props.inputType === PropertyItemAssetInputType.Url && (
			<>
				<StyledButton onClick={props.onChooseClick}>Choose ...</StyledButton>
			</>
		)}
	</StyledAssetItemContainer>
);
