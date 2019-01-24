import * as Components from '../components';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import { WithStore } from '../store';
import { LibraryContainer } from './library-container';
import { LibraryStoreItemContainer } from './library-store-item-container';
import { SpaceSize } from '../components/space';
import { Color } from '../components/colors';
import { MessageType } from '../message';
import * as uuid from 'uuid';
import { ExternalLink } from 'react-feather';
import * as T from '../types';
import { MessageType as MT } from '../message';
import { LibraryStoreItemState } from '../model';

const validatePackageName = require('validate-npm-package-name');

const Flex = styled.div`
	display: flex;
`;

@MobxReact.inject('store')
@MobxReact.observer
export class LibraryStoreContainer extends React.Component {
	@Mobx.observable private searchValue = '';

	@Mobx.observable private submittedValue = '';

	@Mobx.observable private isValidPackage = false;

	@Mobx.computed
	private get isValidName() {
		const fragments = this.searchValue.split('@');
		const name = (fragments.length >= 3 ? fragments.slice(0, -1) : fragments).join('@');
		const validation = validatePackageName(name);

		if (!validation.validForOldPackages) {
			return false;
		}

		return true;
	}

	private checkPackage = async (raw: string) => {
		const fragments = raw.split('@');
		const name = (fragments.length >= 3 ? fragments.slice(0, -1) : fragments).join('@');
		const response = await fetch(`https://registry.npmjs.cf/${name}`, { method: 'HEAD' });

		if (raw === this.searchValue) {
			this.isValidPackage = response.ok;
		}
	};

	public componentDidMount() {
		const { store } = this.props as WithStore;
		const app = store.getApp();

		Mobx.autorun(async () => {
			this.isValidPackage = false;
			this.submittedValue = '';

			if (!this.isValidName) {
				return;
			}

			const searchValue = this.searchValue;
			this.checkPackage(searchValue);
		});

		Mobx.autorun(() => {
			if (this.submittedValue && this.isValidPackage) {
				const fragments = this.submittedValue.split('@');
				const name = (fragments.length >= 3 ? fragments.slice(0, -1) : fragments).join('@');
				const existing = store.libraryStore.getItemByPackageName(name);

				this.submittedValue = '';

				if (existing) {
					existing.connect(store.getApp(), { project: store.getProject() });
				} else {
					app.send({
						id: uuid.v4(),
						type: MT.ConnectNpmPatternLibraryRequest,
						payload: {
							npmId: this.submittedValue,
							projectId: store.getProject().getId()
						}
					});
				}
			}
		});
	}

	public render(): JSX.Element | null {
		const { store } = this.props as WithStore;
		const app = store.getApp();
		const isValidPackage = this.isValidPackage;
		const libraryStore = store.libraryStore;

		return (
			<div style={{ overflow: 'scroll', userSelect: 'none' }}>
				<div
					style={{
						width: '90%',
						maxWidth: '1080px',
						margin: '0 auto',
						padding: `${Components.getSpace(
							Components.SpaceSize.XXL
						)}px 0 ${Components.getSpace(Components.SpaceSize.XXXL)}px`
					}}
				>
					<Components.Space size={SpaceSize.XS}>
						<Components.Headline order={3} bold textColor={Components.Color.Grey10}>
							Connected Libraries
						</Components.Headline>
						<Components.Space sizeBottom={SpaceSize.XS} />
						<Components.Copy textColor={Color.Grey36} size={Components.CopySize.M}>
							See and update all libraries connected to this project
						</Components.Copy>
					</Components.Space>
					<Components.Space sizeBottom={SpaceSize.XL} />
					<Flex>
						{libraryStore.withLibrary.map(item => (
							<LibraryStoreItemContainer key={item.id} item={item} />
						))}
					</Flex>
				</div>
				<div style={{ background: Components.Color.White }}>
					<div
						style={{
							width: '90%',
							maxWidth: '1080px',
							margin: '0 auto',
							padding: `${Components.getSpace(Components.SpaceSize.XXXL + SpaceSize.S)}px 0`
						}}
					>
						<Components.Space size={SpaceSize.XS}>
							<Components.Headline order={2} bold textColor={Components.Color.Grey10}>
								Library Store
							</Components.Headline>
							<Components.Space sizeBottom={SpaceSize.M} />
							<Components.Copy textColor={Color.Grey36} size={Components.CopySize.M}>
								Browse and install compatible code libraries for your prototype
							</Components.Copy>
						</Components.Space>

						<Components.Space sizeBottom={SpaceSize.XXL} />
						<Flex>
							{libraryStore.recommendations.map(item => (
								<LibraryStoreItemContainer key={item.id} item={item} />
							))}
						</Flex>
						<Components.Space sizeTop={SpaceSize.XXXL} />
						<Components.Space size={SpaceSize.XS}>
							<div
								style={{
									width: '100%',
									height: '.5px',
									background: Components.Color.Grey90
								}}
							/>
						</Components.Space>
						<Components.Space sizeTop={SpaceSize.XXXL} />

						<Flex>
							<div style={{ width: '50%', flexShrink: 0 }}>
								<Components.Space size={SpaceSize.XS}>
									<div style={{ maxWidth: '360px' }}>
										<Components.Headline
											order={4}
											bold
											textColor={Components.Color.Grey10}
										>
											Install Library from NPM
										</Components.Headline>
										<Components.Space sizeBottom={SpaceSize.XS} />
										<Components.Copy
											textColor={Color.Grey36}
											size={Components.CopySize.M}
										>
											Install any package with a React and TypeScript library from NPM.
										</Components.Copy>
										<Components.Space sizeBottom={SpaceSize.M} />
										<Components.InputButton
											placeholder="Package Name"
											value={this.searchValue}
											isValid={() => isValidPackage}
											onSubmit={e => {
												e.preventDefault();
												this.submittedValue = this.searchValue;
											}}
											onChange={e => {
												this.searchValue = e.target.value;
											}}
										>
											Install
										</Components.InputButton>
									</div>
								</Components.Space>
							</div>
							{store.getApp().isHostType(T.HostType.Electron) && (
								<div style={{ width: '50%', flexShrink: 0 }}>
									<Components.Space size={SpaceSize.XS}>
										<div style={{ maxWidth: '360px' }}>
											<Components.Headline
												order={4}
												bold
												textColor={Components.Color.Grey10}
											>
												Install Local Library
											</Components.Headline>
											<Components.Space sizeBottom={SpaceSize.XS} />
											<Components.Copy
												textColor={Color.Grey36}
												size={Components.CopySize.M}
											>
												Select a library running on your local computer. Build it and
												connect the package.json in the library folder.
											</Components.Copy>
											<Components.Space sizeBottom={SpaceSize.M} />
											<Components.Button
												order={Components.ButtonOrder.Primary}
												size={Components.ButtonSize.Medium}
												onClick={() =>
													app.send({
														id: uuid.v4(),
														payload: {
															library: undefined,
															projectId: store.getProject().getId()
														},
														type: MessageType.ConnectPatternLibraryRequest
													})
												}
											>
												Connect Local Library
											</Components.Button>
											<Components.Space sizeBottom={SpaceSize.S} />
											<Components.Link
												color={Color.Grey50}
												onClick={() => {
													store.getSender().send({
														type: MessageType.OpenExternalURL,
														id: uuid.v4(),
														payload:
															'https://meetalva.io/doc/docs/guides/library.html'
													});
												}}
											>
												<div style={{ display: 'flex', alignItems: 'center' }}>
													<ExternalLink
														size={Components.IconSize.XS}
														strokeWidth={1.5}
													/>
													<Components.Space sizeRight={SpaceSize.XXS} />
													See Guide
												</div>
											</Components.Link>
											<Components.Space sizeTop={SpaceSize.XXL} />
										</div>
									</Components.Space>
								</div>
							)}
						</Flex>
						<Components.Space sizeTop={SpaceSize.XXXL} />
					</div>
				</div>
			</div>
		);
	}
}
