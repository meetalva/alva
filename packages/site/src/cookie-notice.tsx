import * as React from 'react';
import * as D from '@meetalva/alva-design';

export class CookieNotice extends React.Component {
	public state = {
		display: true
	};

	public componentDidMount() {
		this.setState({ display: document.cookie.indexOf('hidecookienotice=1') === -1 });
	}

	public render() {
		return (
			this.state.display === true && (
				<D.CookieNotice
					text="This website uses cookies to ensure you get the best experience on our website."
					linkText="Learn more"
					linkHref="doc/docs/privacypolicy"
					buttonText="Got it"
					buttonOnClick={() => {
						document.cookie = 'hidecookienotice=1;path=/';
						this.setState({ display: false });
					}}
				/>
			)
		);
	}
}
