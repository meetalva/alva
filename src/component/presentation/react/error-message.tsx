import * as React from 'react';

export interface ErrorMessageProps {
	error: string;
	patternName: string;
}

export const ErrorMessage: React.StatelessComponent<ErrorMessageProps> = props => (
	<div
		style={{
			'background-color': 'rgb(240, 40, 110)',
			color: 'white',
			padding: '12px 15px',
			'text-align': 'center'
		}}
	>
		<p
			style={{
				margin: '0',
				'font-family':
					'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
				'font-size': '15px',
				'line-height': '22px'
			}}
		>
			{props.patternName} failed to render: {props.error}
		</p>
	</div>
);
