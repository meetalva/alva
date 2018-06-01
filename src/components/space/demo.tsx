import { Color } from '../colors';
import DemoContainer from '../demo-container';
import { Space, SpaceSize } from './index';
import * as React from 'react';
import styled from 'styled-components';

const DemoTileSpace = styled(Space)`
	display: flex;
	flex-wrap: wrap;
`;

const DemoRowSpace = styled(Space)`
	display: flex;
	align-content: stretch;
	flex-wrap: wrap;
	justify-content: space-between;
`;

const InsetSpace = styled(Space)`
	background-color: ${Color.Blue40};
	width: 250px;
	height: 250px;
`;

const StackSpace = styled(Space)`
	background-color: ${Color.Orange};
`;

const InlineSpace = styled(Space)`
	background-color: ${Color.Green};
`;

const Content = styled.div`
	background-color: ${Color.White};
	width: 100%;
	height: 100%;
	text-align: center;
	line-height: 2em;
`;

const SpaceDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Space">
		<Space>Inset</Space>
		<DemoTileSpace size={[SpaceSize.L, SpaceSize.None]}>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.XS} inside={true}>
					<Content>{SpaceSize[SpaceSize.XS]}</Content>
				</InsetSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.XS} inside={true}>
					<Content>{SpaceSize[SpaceSize.XS]}</Content>
				</InsetSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.S} inside={true}>
					<Content>{SpaceSize[SpaceSize.S]}</Content>
				</InsetSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.M} inside={true}>
					<Content>{SpaceSize[SpaceSize.M]}</Content>
				</InsetSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.L} inside={true}>
					<Content>{SpaceSize[SpaceSize.L]}</Content>
				</InsetSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.XL} inside={true}>
					<Content>{SpaceSize[SpaceSize.XL]}</Content>
				</InsetSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InsetSpace size={SpaceSize.XXL} inside={true}>
					<Content>{SpaceSize[SpaceSize.XXL]}</Content>
				</InsetSpace>
			</Space>
		</DemoTileSpace>

		<Space sizeTop={SpaceSize.XXL}>Inline</Space>
		<DemoRowSpace size={[SpaceSize.L, SpaceSize.None]}>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.XS} inside={true}>
					<Content>{SpaceSize[SpaceSize.XS]}</Content>
				</InlineSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.XS} inside={true}>
					<Content>{SpaceSize[SpaceSize.XS]}</Content>
				</InlineSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.S} inside={true}>
					<Content>{SpaceSize[SpaceSize.S]}</Content>
				</InlineSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.M} inside={true}>
					<Content>{SpaceSize[SpaceSize.M]}</Content>
				</InlineSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.L} inside={true}>
					<Content>{SpaceSize[SpaceSize.L]}</Content>
				</InlineSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.XL} inside={true}>
					<Content>{SpaceSize[SpaceSize.XL]}</Content>
				</InlineSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<InlineSpace sizeRight={SpaceSize.XXL} inside={true}>
					<Content>{SpaceSize[SpaceSize.XXL]}</Content>
				</InlineSpace>
			</Space>
		</DemoRowSpace>

		<Space sizeTop={SpaceSize.XXL}>Stack</Space>
		<Space size={[SpaceSize.L, SpaceSize.None]}>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.XS} inside={true}>
					<Content>{SpaceSize[SpaceSize.XS]}</Content>
				</StackSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.XS} inside={true}>
					<Content>{SpaceSize[SpaceSize.XS]}</Content>
				</StackSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.S} inside={true}>
					<Content>{SpaceSize[SpaceSize.S]}</Content>
				</StackSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.M} inside={true}>
					<Content>{SpaceSize[SpaceSize.M]}</Content>
				</StackSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.L} inside={true}>
					<Content>{SpaceSize[SpaceSize.L]}</Content>
				</StackSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.XL} inside={true}>
					<Content>{SpaceSize[SpaceSize.XL]}</Content>
				</StackSpace>
			</Space>
			<Space size={SpaceSize.XS}>
				<StackSpace sizeBottom={SpaceSize.XXL} inside={true}>
					<Content>{SpaceSize[SpaceSize.XXL]}</Content>
				</StackSpace>
			</Space>
		</Space>
	</DemoContainer>
);

export default SpaceDemo;
