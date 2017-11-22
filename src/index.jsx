import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const mypage = require('../../stacked-example/stacked/projects/my-project/mypage.json');
		console.log('mypage', mypage);
		const components = [];
		mypage.root.children.map((pattern, index) => {
			const component = require(`../../stacked-example/lib/${pattern.patternSrc}/index.js`).default;
			components.push(component({}));
		});
		console.log(components);
		return (
			<div>
				hello world
				{components}
			</div>
		);
	}
}

render(
	<App />,
	document.getElementById('app')
);
