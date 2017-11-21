import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const Layout = require('../../stacked-example/lib/patterns/atoms/layout/index.js').default;
		const Button = require('../../stacked-example/lib/patterns/atoms/button/index.js').default;
		return (
			<div>
				hello world
				{Layout({
					children: [
						Button({disabled: true, children: 'asdf'}),
						'Hello World!'
					]
				})}
			</div>
		);
	}
}

render(
	<App />,
	document.getElementById('app')
);
