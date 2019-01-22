import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { WithStore } from '../store';
import * as Types from '../types';
import { ButtonSize } from '../components';

export interface LibrarySettingsContainerProps {
	library: Model.PatternLibrary;
}

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryContainer extends React.Component<LibrarySettingsContainerProps> {
	public render(): JSX.Element {
		const props = this.props as LibrarySettingsContainerProps & WithStore;
		const capabilities = props.library.getCapabilites();

		const mayUpdate =
			capabilities.includes(Types.LibraryCapability.Update) &&
			props.store.getApp().hasFileAccess();

		const mayReconnect =
			capabilities.includes(Types.LibraryCapability.Reconnect) &&
			props.store.getApp().hasFileAccess();

		return (
			<Components.LibraryBox
				key={props.library.getId()}
				name={props.library.getName()}
				description={props.library.getDescription()}
				state={props.library.getState()}
				color={props.library.getColor() || Components.Color.Grey50}
				image={props.library.getImage() || `data:image/svg+xml;utf8,${FallbackImage}`}
				version={props.library.getVersion()}
				install={
					mayUpdate ? (
						<Components.Button
							disabled={props.library.getState() === Types.PatternLibraryState.Connecting}
							size={ButtonSize.Medium}
							inverted
							textColor={Components.Color.Grey50}
							onClick={() => {
								if (props.library.getState() === Types.PatternLibraryState.Connecting) {
									return;
								}

								props.library.setState(Types.PatternLibraryState.Connecting);
								props.store.updatePatternLibrary(props.library);
							}}
						>
							{props.library.getState() === Types.PatternLibraryState.Connecting
								? 'Updating …'
								: 'Update'}
						</Components.Button>
					) : (
						mayReconnect && (
							<Components.Button
								disabled={props.library.getState() === Types.PatternLibraryState.Connecting}
								size={ButtonSize.Medium}
								inverted
								textColor={Components.Color.Grey50}
								onClick={() => {
									if (props.library.getState() === Types.PatternLibraryState.Connecting) {
										return;
									}

									props.library.setState(Types.PatternLibraryState.Connecting);
									props.store.connectPatternLibrary(props.library);
								}}
							>
								{props.library.getState() === Types.PatternLibraryState.Connecting
									? 'Connecting …'
									: 'Connect'}
							</Components.Button>
						)
					)
				}
			/>
		);
	}
}

const FallbackImage = `
	<svg width="360px" height="140px" viewBox="0 0 360 140" version="1.1" xmlns="http://www.w3.org/2000/svg">
		<rect fill="#EEEEEE" x="0" y="0" width="360" height="140"></rect>
		<path d="M156.161254,0 L300.421815,0 L337.934702,140 L48.0573715,140 L21.0759609,39.3040049 C20.6466601,37.7018326 21.5971656,36.0563388 23.1985853,35.6272397 L156.161254,0 Z" fill="#FFFFFF"></path>
		<path d="M205.863682,140 L306.19713,113.115734 C308.864461,112.401025 311.606145,113.983937 312.320854,116.651268 L318.577128,140 L205.863682,140 Z" fill="#EEEEEE"></path>
		<path d="M202.625286,98.2778245 L241.178326,87.9475687 C242.245258,87.6616851 243.341932,88.2948501 243.627815,89.3617823 L245.427224,96.0772666 C245.713108,97.1441988 245.079943,98.2408727 244.013011,98.5267563 L205.459971,108.857012 C204.393039,109.142896 203.296365,108.509731 203.010481,107.442799 L201.211073,100.727314 C200.925189,99.660382 201.558354,98.5637081 202.625286,98.2778245 Z" fill="#EEEEEE"></path>
		<path d="M198.089791,81.3511243 L291.784596,56.2456769 C292.851528,55.9597933 293.948202,56.5929583 294.234085,57.6598905 L296.033494,64.3753748 C296.319378,65.442307 295.686213,66.5389809 294.619281,66.8248646 L200.924475,91.9303119 C199.857543,92.2161956 198.760869,91.5830306 198.474986,90.5160984 L196.675577,83.8006141 C196.389693,82.7336819 197.022858,81.6370079 198.089791,81.3511243 Z" fill="#EEEEEE"></path>
		<path d="M193.554295,64.4244241 L270.282403,43.8651895 C271.349335,43.5793059 272.446009,44.2124709 272.731893,45.2794031 L274.531301,51.9948874 C274.817185,53.0618196 274.18402,54.1584935 273.117088,54.4443772 L196.38898,75.0036117 C195.322048,75.2894954 194.225374,74.6563304 193.93949,73.5893982 L192.140081,66.8739139 C191.854198,65.8069817 192.487363,64.7103077 193.554295,64.4244241 Z" fill="#EEEEEE"></path>
		<path d="M108.551275,140 L74.0424251,140 L62.6366703,97.4331436 C62.3507867,96.3662114 62.9839517,95.2695374 64.0508839,94.9836538 L163.541244,68.3252922 C164.608176,68.0394085 165.70485,68.6725735 165.990734,69.7395057 L179.190505,119.001723 C179.476389,120.068655 178.843224,121.165329 177.776291,121.451213 L108.551275,140 Z M122.906494,115.655062 C126.9837,114.562578 129.396673,110.347005 128.296021,106.239316 C127.195369,102.131627 122.997886,99.6873205 118.920681,100.779804 C114.843476,101.872288 112.430503,106.087861 113.531155,110.19555 C114.631806,114.303239 118.829289,116.747546 122.906494,115.655062 Z" fill="#EEEEEE"></path>
		<path d="M261.782074,0 L278.064793,0 C277.749641,0.585251001 277.203195,1.04430403 276.510463,1.22992107 L260.210465,5.59749246 C258.876799,5.95484698 257.505957,5.16339076 257.148602,3.8297255 C256.791248,2.49606024 257.582704,1.12521785 258.916369,0.767863324 L261.782074,0 Z" fill="#EEEEEE"></path>
		<path d="M242.012667,5.29719661 L249.860815,3.19429187 C251.19448,2.83693734 252.565322,3.62839357 252.922677,4.96205883 C253.280031,6.29572408 252.488575,7.66656647 251.15491,8.023921 L243.306763,10.1268257 C241.973097,10.4841803 240.602255,9.69272405 240.2449,8.35905879 C239.887546,7.02539353 240.679002,5.65455114 242.012667,5.29719661 Z" fill="#EEEEEE"></path>
		<path d="M212.431189,13.2235299 L232.957113,7.72362516 C234.290778,7.36627063 235.66162,8.15772686 236.018975,9.49139211 C236.376329,10.8250574 235.584873,12.1958998 234.251208,12.5532543 L213.725284,18.053159 C212.391619,18.4105135 211.020776,17.6190573 210.663422,16.285392 C210.306067,14.9517268 211.097524,13.5808844 212.431189,13.2235299 Z" fill="#EEEEEE"></path>
		<path d="M70.2481827,53.7357599 L84.0016709,50.0505238 C84.8018701,49.8361111 85.6243755,50.3109849 85.8387882,51.111184 L86.2041798,52.474844 C86.4185925,53.2750432 85.9437188,54.0975486 85.1435196,54.3119613 L71.3900314,57.9971974 C70.5898322,58.2116101 69.7673268,57.7367364 69.5529141,56.9365372 L69.1875225,55.5728772 C68.9731098,54.7726781 69.4479835,53.9501726 70.2481827,53.7357599 Z" fill="#EEEEEE"></path>
		<path d="M68.5354096,47.3436037 L90.6145307,41.427521 C91.4147298,41.2131083 92.2372353,41.6879821 92.451648,42.4881812 L92.8170396,43.8518412 C93.0314523,44.6520404 92.5565786,45.4745458 91.7563794,45.6889585 L69.6772583,51.6050412 C68.8770591,51.8194539 68.0545537,51.3445802 67.840141,50.544381 L67.4747494,49.180721 C67.2603367,48.3805219 67.7352104,47.5580164 68.5354096,47.3436037 Z" fill="#EEEEEE"></path>
		<ellipse fill="#EEEEEE" transform="translate(57.331320, 56.283344) rotate(-15.000000) translate(-57.331320, -56.283344) " cx="57.3313198" cy="56.2833439" rx="7.32642998" ry="7.5"></ellipse>
	</svg>
`
	.split('\n')
	.map(line => line.trim())
	.join('');
