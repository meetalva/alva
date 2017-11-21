import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const Button = require('../../stacked-example/lib/patterns/atoms/button/index.js').default;
		return (
			<div>
				hello world
				{Button({disabled: true, children: 'asdf'})}
			</div>
		);
	}
}

render(
	<App />,
	document.getElementById('app')
);
