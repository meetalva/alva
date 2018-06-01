import { Color, Headline, Space, SpaceSize } from '../../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../../store';
import styled from 'styled-components';

export const PageListPreview: React.StatelessComponent = MobxReact.inject('store')(
	MobxReact.observer(props => {
		const { store } = props as { store: ViewStore };
		const project = store.getProject();
		if (!project) {
			return <>props.children</>;
		}
		return (
			<StyledPageListPreview>
				<Space size={[SpaceSize.XXL * 3]}>
					<Space size={[SpaceSize.S, SpaceSize.S, SpaceSize.XXXL]}>
						<Headline order={1} tagName="h1" textColor={Color.Grey20}>
							{project.getName()}
						</Headline>
					</Space>
					{props.children}
				</Space>
			</StyledPageListPreview>
		);
	})
);

const StyledPageListPreview = styled.div`
	box-sizing: border-box;
	overflow: auto;
	width: 100%;
	min-height: 100vh;
`;
