import * as React from 'react';
import styled from '@emotion/styled';

export interface ImageProps {
	alt?: string;
	className?: string;
	/** @asset */ src?: string;
	size?: string;
}

const StyledImage = styled.img`
	display: block;
	width: ${(props: ImageProps) => props.size || '100%'};
	object-fit: cover;
`;

export const Image: React.StatelessComponent<ImageProps> = (props): JSX.Element => {
	return (
		<StyledImage alt={props.alt} className={props.className} src={props.src} size={props.size} />
	);
};
