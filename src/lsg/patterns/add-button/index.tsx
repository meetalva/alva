import { colors } from '../colors';
import { Icon, IconName, Size as IconSize } from '../icons';
import * as React from 'react';
import { getSpace, Size as SpaceSize } from '../space';
import styled from 'styled-components';

export interface AddButtonProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	label?: string;
	active?: boolean;
}

interface StyledAddButtonProps {
	active?: boolean;
}

interface StyledIconProps {
	active?: boolean;
}

const StyledAddButton = styled.div`
	width: 100%;
	border-top: 1px solid ${colors.black.toString('rgb', { alpha: 0.1 })};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
	}
	cursor: default;
	user-select: none;
	display: flex;
	flex: none;
	height: 40px;
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.XXS)}px ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XXS)}px
		${getSpace(SpaceSize.L)}px;
	justify-content: space-between;
	color: ${colors.grey36.toString()};

	&:hover {
		background: ${colors.grey90.toString()};
	}

	${(props: StyledAddButtonProps) =>
		props.active
			? `
		border-top: 1px solid ${colors.blue.toString('rgb', { alpha: 0.1 })};
		@media screen and (-webkit-min-device-pixel-ratio: 2) {
			border-top-width: 0.5px;
		}
		background: ${colors.blue80.toString()};
		color: ${colors.blue.toString()};

		&:hover {
			background: ${colors.blue80.toString()};
		}
	`
			: ''};
`;

const StyledLabelWrapper = styled.div`
	font-size: 15px;
	padding-top: ${getSpace(SpaceSize.XS)}px;
`;

const StyledIconWrapper = styled.div`
	margin: ${getSpace(SpaceSize.XS)}px;
	padding: ${getSpace(SpaceSize.XXS)}px;
	border-radius: ${getSpace(SpaceSize.XXS)}px;
`;

const StyledIcon = styled(Icon)`
	fill: ${colors.grey60.toString()};

	${(props: StyledIconProps) => (props.active ? `fill: ${colors.blue.toString()};` : '')};
`;

const AddButton: React.StatelessComponent<AddButtonProps> = props => (
	<StyledAddButton onClick={props.onClick} active={props.active}>
		<StyledLabelWrapper>{props.label}</StyledLabelWrapper>

		<StyledIconWrapper>
			<StyledIcon active={props.active} size={IconSize.XS} name={IconName.Arrow} />
		</StyledIconWrapper>
	</StyledAddButton>
);

export default AddButton;
