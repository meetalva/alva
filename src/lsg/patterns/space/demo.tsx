import { Color, colors } from '../colors';
import Space, { Size } from './index';
import * as React from 'react';
import styled from 'styled-components';

const blue: Color = new Color({displayName: 'Demo Blue', rgb: [91, 177, 255]});
const green: Color = new Color({displayName: 'Demo Green', rgb: [91, 255, 151]});
const violet: Color = new Color({displayName: 'Demo Violet', rgb: [181, 91, 255]});

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
	background-color: ${blue.toString()};
	width: 250px;
	height: 250px;
`;

const StackSpace = styled(Space)`
	background-color: ${green.toString()};
`;

const InlineSpace = styled(Space)`
	background-color: ${violet.toString()};
`;

const Content = styled.div`
	background-color: ${colors.white.toString()};
	width: 100%;
	height: 100%;
	text-align: center;
	line-height: 2em;
`;

const SpaceDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<Space>Inset</Space>
		<DemoTileSpace size={[Size.L, Size.None]}>
			<Space size={Size.XS}>
				<InsetSpace size={Size.XS} inside={true}><Content>{Size[Size.XS]}</Content></InsetSpace>
			</Space>
			<Space size={Size.XS}>
				<InsetSpace size={Size.XS} inside={true}><Content>{Size[Size.XS]}</Content></InsetSpace>
			</Space>
			<Space size={Size.XS}>
				<InsetSpace size={Size.S} inside={true}><Content>{Size[Size.S]}</Content></InsetSpace>
			</Space>
			<Space size={Size.XS}>
				<InsetSpace size={Size.M} inside={true}><Content>{Size[Size.L]}</Content></InsetSpace>
			</Space>
			<Space size={Size.XS}>
				<InsetSpace size={Size.L} inside={true}><Content>{Size[Size.L]}</Content></InsetSpace>
			</Space>
			<Space size={Size.XS}>
				<InsetSpace size={Size.XL} inside={true}><Content>{Size[Size.XL]}</Content></InsetSpace>
			</Space>
			<Space size={Size.XS}>
				<InsetSpace size={Size.XXL} inside={true}><Content>{Size[Size.XXL]}</Content></InsetSpace>
			</Space>
		</DemoTileSpace>

		<Space sizeTop={Size.XXL}>Inline</Space>
		<DemoRowSpace size={[Size.L, Size.None]}>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.XS} inside={true}><Content>{Size[Size.XS]}</Content></InlineSpace>
			</Space>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.XS} inside={true}><Content>{Size[Size.XS]}</Content></InlineSpace>
			</Space>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.S} inside={true}><Content>{Size[Size.S]}</Content></InlineSpace>
			</Space>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.M} inside={true}><Content>{Size[Size.L]}</Content></InlineSpace>
			</Space>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.L} inside={true}><Content>{Size[Size.L]}</Content></InlineSpace>
			</Space>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.XL} inside={true}><Content>{Size[Size.XL]}</Content></InlineSpace>
			</Space>
			<Space size={Size.XS}>
				<InlineSpace sizeRight={Size.XXL} inside={true}><Content>{Size[Size.XXL]}</Content></InlineSpace>
			</Space>
		</DemoRowSpace>

		<Space sizeTop={Size.XXL}>Stack</Space>
		<Space size={[Size.L, Size.None]}>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.XS} inside={true}><Content>{Size[Size.XS]}</Content></StackSpace>
			</Space>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.XS} inside={true}><Content>{Size[Size.XS]}</Content></StackSpace>
			</Space>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.S} inside={true}><Content>{Size[Size.S]}</Content></StackSpace>
			</Space>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.M} inside={true}><Content>{Size[Size.L]}</Content></StackSpace>
			</Space>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.L} inside={true}><Content>{Size[Size.L]}</Content></StackSpace>
			</Space>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.XL} inside={true}><Content>{Size[Size.XL]}</Content></StackSpace>
			</Space>
			<Space size={Size.XS}>
				<StackSpace sizeBottom={Size.XXL} inside={true}><Content>{Size[Size.XXL]}</Content></StackSpace>
			</Space>
		</Space>
	</div>
);

export default SpaceDemo;
