import * as React from 'react';
import * as Styles from './splash-screen.styles';

export const SplashScreenSlotLeft: React.SFC = p => <>{p.children}</>;
export const SplashScreenSlotRight: React.SFC = p => <>{p.children}</>;
export const SplashScreenSlotBottom: React.SFC = p => <>{p.children}</>;

function slot(children: React.ReactNode, type: React.ComponentType): JSX.Element | null {
	return (
		React.Children.toArray(children)
			.filter((c): c is React.ReactElement<unknown> => typeof c === 'object')
			.find(c => c.type === type) || null
	);
}

export const SplashScreen: React.SFC = props => {
	const left = slot(props.children, SplashScreenSlotLeft);
	const right = slot(props.children, SplashScreenSlotRight);
	const bottom = slot(props.children, SplashScreenSlotBottom);

	return (
		<Styles.StyledContainer>
			<Styles.StyledSection type="primary" style={{ gridRowStart: 1, gridRowEnd: 3 }}>
				{left}
			</Styles.StyledSection>
			<Styles.StyledSection type="secondary">{right}</Styles.StyledSection>
			<div style={{ gridColumnStart: 2 }}>{bottom}</div>
		</Styles.StyledContainer>
	);
};

export default SplashScreen;
