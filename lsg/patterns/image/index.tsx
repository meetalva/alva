import * as React from 'react';
import styled from 'styled-components';

export interface ImageProps {
  alt: string;
  className?: string;
  src: string;
}

const StyledImage = styled.img`
  display: block;
`;

const Image: React.StatelessComponent<ImageProps> = (props) => {

  return (
    <StyledImage
      alt={props.alt}
      className={props.className}
      src={props.src}
    />
  );
};

export default Image;
