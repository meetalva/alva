import * as C from '../components';
import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import { WithStore } from '../store';
import { LibraryStoreItemContainer, LibraryStoreItemSize } from './library-store-item-container';
import { SpaceSize } from '../components/space';
import { Color } from '../components/colors';
import { MessageType } from '../message';
import * as uuid from 'uuid';
import { ExternalLink, ChevronDown, RotateCw } from 'react-feather';
import * as T from '../types';
import { MessageType as MT } from '../message';
import { PatternLibraryInstallType } from '../types';
import { When } from './when';

const validatePackageName = require('validate-npm-package-name');

const DetailsSummary = styled.summary`
	outline: none;

	&::-webkit-details-marker {
		display: none;
	}
	&::-moz-list-bullet {
		list-style-type: none;
		display: block;
	}
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

	private handleDetailsClick: React.MouseEventHandler<HTMLDetailsElement> = e => {
		e.preventDefault();
		const { store } = this.props as WithStore;
		const libraryStore = store.libraryStore;
		libraryStore.installedOpen = !libraryStore.installedOpen;
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

				if (existing) {
					existing.connect(store.getApp(), {
						npmId: this.submittedValue,
						project: store.getProject(),
						installType: PatternLibraryInstallType.Remote
					});
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

				this.submittedValue = '';
			}
		});
	}

	public render(): JSX.Element | null {
		const { store } = this.props as WithStore;
		const app = store.getApp();
		const isValidPackage = this.isValidPackage;
		const libraryStore = store.libraryStore;
		const updateAvailable = libraryStore.updateCount > 0;

		return (
			<div style={{ overflow: 'scroll', userSelect: 'none' }}>
				<div
					style={{
						width: '90%',
						maxWidth: '1080px',
						margin: '0 auto',
						padding: `${C.getSpace(C.SpaceSize.L)}px 0`
					}}
				>
					<Details mayToggle={libraryStore.updateCount === 0} open={libraryStore.installedOpen}>
						<DetailsSummary onClick={this.handleDetailsClick}>
							<C.Space size={SpaceSize.XS}>
								<C.Flex
									alignItems={C.FlexAlignItems.Center}
									justifyContent={C.FlexJustifyContent.SpaceBetween}
								>
									<C.Flex>
										<div>
											<C.Space sizeTop={2} />
											<C.BadgeIcon
												color={updateAvailable ? C.Color.Orange : C.Color.Green}
											>
												{libraryStore.updateCount > 0 ? libraryStore.updateCount : ''}
											</C.BadgeIcon>
										</div>
										<C.Space sizeRight={C.SpaceSize.XS + C.SpaceSize.XXS} />
										<div>
											<C.Headline
												order={4}
												bold
												textColor={updateAvailable ? C.Color.Orange : C.Color.Green}
											>
												{updateAvailable
													? 'Updates available'
													: 'Everything up to date'}
											</C.Headline>
											<C.Space sizeBottom={SpaceSize.XS} />
											<When mayToggle={libraryStore.updateCount === 0}>
												<C.Flex style={{ alignItems: 'center' }}>
														<C.Copy textColor={Color.Grey36}>
															Show {libraryStore.withLibrary.length} installed{' '}
															{libraryStore.withLibrary.length === 1
																? 'library'
																: 'libraries'}
														</C.Copy>
													<C.Space sizeRight={SpaceSize.XXS} />
													<ChevronDown color={Color.Grey36} size={C.IconSize.XS} />
												</C.Flex>
											</When>
										</div>
									</C.Flex>
									{store.getApp().isHostType(T.HostType.Electron) && (
										<C.Button
											order={C.ButtonOrder.Secondary}
											size={C.ButtonSize.Medium}
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
											Install Local Library
										</C.Button>
									)}
								</C.Flex>
							</C.Space>
						</DetailsSummary>
						<C.Space sizeBottom={C.SpaceSize.XS} />
						<C.Flex
							style={{
								flexWrap: 'wrap'
							}}
						>
							{(libraryStore.updateCount === 0 ? libraryStore.withLibrary : libraryStore.withUpdate).map(item => (
								<LibraryStoreItemContainer
									key={item.id}
									item={item}
									size={LibraryStoreItemSize.Medium}
								/>
							))}
						</C.Flex>
						<C.Space size={SpaceSize.XS}>
							<C.Link onClick={() => libraryStore.checkForUpdates()} color={C.Color.Grey50}>
								<C.Flex>
									<RotateCw size={C.IconSize.XS} strokeWidth={2} />
									<C.Space sizeRight={SpaceSize.XS} />
									Check for Updates
								</C.Flex>
							</C.Link>
						</C.Space>

						<C.Space sizeBottom={C.SpaceSize.XS} />
					</Details>
				</div>

				<div
					style={{
						background: C.Color.White,
						borderTop: `1px solid ${Color.Grey90}`
					}}
				>
					<div
						style={{
							width: '90%',
							maxWidth: '1080px',
							margin: '0 auto',
							padding: `${C.getSpace(C.SpaceSize.XXXL + SpaceSize.L)}px 0`
						}}
					>
						<C.Space size={SpaceSize.XS}>
							<div style={{ maxWidth: '260px' }}>
								<C.Headline order={2} bold textColor={C.Color.Grey10}>
									Library Store
								</C.Headline>
								<C.Space sizeBottom={SpaceSize.M} />
								<C.Copy textColor={Color.Grey36} size={C.CopySize.M}>
									Browse and install compatible code libraries for your prototype
								</C.Copy>
							</div>
						</C.Space>

						<C.Space sizeBottom={SpaceSize.XXL} />
						<C.Flex>
							{libraryStore.recommendations.map(item => (
								<LibraryStoreItemContainer
									key={item.id}
									item={item}
									size={LibraryStoreItemSize.Large}
								/>
							))}
						</C.Flex>
						<C.Space sizeTop={SpaceSize.XXXL} />
						<C.Space size={SpaceSize.XS}>
							<div
								style={{
									width: '100%',
									height: '.5px',
									background: C.Color.Grey90
								}}
							/>
						</C.Space>
						<C.Space sizeTop={SpaceSize.XXXL} />

						<C.Flex>
							<div style={{ width: '50%', flexShrink: 0 }}>
								<C.Space size={SpaceSize.XS}>
									<div style={{ maxWidth: '360px' }}>
										<C.Headline order={4} bold textColor={C.Color.Grey10}>
											Install Library from NPM
										</C.Headline>
										<C.Space sizeBottom={SpaceSize.XS} />
										<C.Copy textColor={Color.Grey36} size={C.CopySize.M}>
											Install any package with a React and TypeScript library from NPM.
										</C.Copy>
										<C.Space sizeBottom={SpaceSize.M} />
										<C.InputButton
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
										</C.InputButton>
									</div>
								</C.Space>
							</div>
							{store.getApp().isHostType(T.HostType.Electron) && (
								<div style={{ width: '50%', flexShrink: 0 }}>
									<C.Space size={SpaceSize.XS}>
										<div style={{ maxWidth: '360px' }}>
											<C.Headline order={4} bold textColor={C.Color.Grey10}>
												Install Local Library
											</C.Headline>
											<C.Space sizeBottom={SpaceSize.XS} />
											<C.Copy textColor={Color.Grey36} size={C.CopySize.M}>
												Select a library running on your local computer. Build it and
												select the package.json in the library folder.
											</C.Copy>
											<C.Space sizeBottom={SpaceSize.M} />
											<C.Button
												order={C.ButtonOrder.Primary}
												size={C.ButtonSize.Medium}
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
												Install Local Library
											</C.Button>
											<C.Space sizeBottom={SpaceSize.S} />
											<C.Link
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
													<ExternalLink size={C.IconSize.XS} strokeWidth={1.5} />
													<C.Space sizeRight={SpaceSize.XXS} />
													See Guide
												</div>
											</C.Link>
											<C.Space sizeTop={SpaceSize.XXL} />
										</div>
									</C.Space>
								</div>
							)}
						</C.Flex>
						<C.Space sizeTop={SpaceSize.XXXL} />
					</div>
				</div>
			</div>
		);
	}
}

const Details = styled.details<{ mayToggle: boolean; }>`
	${props => props.mayToggle ? '' : 'appearance: none;'};
`;
