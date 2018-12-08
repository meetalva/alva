import { Pattern } from '../../pattern';
import { BuiltInContext, BuiltInResult } from '../pattern-library';
import * as PatternProperty from '../../pattern-property';
import * as Types from '../../../types';

const PATTERN_CONTEXT_ID = 'synthetic:image';
const SRC_CONTEXT_ID = 'src';
const WIDTH_CONTEXT_ID = 'width';
const HEIGHT_CONTEXT_ID = 'height';
const MIN_WIDTH_CONTEXT_ID = 'min-width';
const MAX_WIDTH_CONTEXT_ID = 'max-width';
const MIN_HEIGHT_CONTEXT_ID = 'min-height';
const MAX_HEIGHT_CONTEXT_ID = 'max-height';
const ONCLICK_CONTEXT_ID = 'onClick';

export const Image = (context: BuiltInContext): BuiltInResult => {
	const patternId = context.options.getGlobalPatternId(PATTERN_CONTEXT_ID);

	const properties = [
		new PatternProperty.PatternAssetProperty({
			contextId: SRC_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, SRC_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Image',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'src'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: WIDTH_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, WIDTH_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Width',
			group: 'Default Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'width'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: HEIGHT_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, HEIGHT_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Height',
			group: 'Default Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'height'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MIN_WIDTH_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MIN_WIDTH_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Width',
			group: 'Minimum Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'minWidth'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MIN_HEIGHT_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MIN_HEIGHT_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Height',
			group: 'Minimum Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'minHeight'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MAX_WIDTH_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MAX_WIDTH_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Width',
			group: 'Maximum Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'maxWidth'
		}),
		new PatternProperty.PatternStringProperty({
			contextId: MAX_HEIGHT_CONTEXT_ID,
			id: context.options.getGlobalPropertyId(patternId, MAX_HEIGHT_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Height',
			group: 'Maximum Size',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'maxHeight'
		}),
		new PatternProperty.PatternEventHandlerProperty({
			contextId: ONCLICK_CONTEXT_ID,
			description: 'You can set an interaction that happens on Click.',
			event: new PatternProperty.PatternEvent({
				type: Types.PatternEventType.MouseEvent
			}),
			group: '',
			hidden: false,
			id: context.options.getGlobalPropertyId(patternId, ONCLICK_CONTEXT_ID),
			inputType: Types.PatternPropertyInputType.Default,
			label: 'Interaction',
			origin: Types.PatternPropertyOrigin.BuiltIn,
			propertyName: 'onClick',
			required: false
		})
	];

	const pattern = new Pattern(
		{
			contextId: PATTERN_CONTEXT_ID,
			description: 'for Design Drafts',
			exportName: 'default',
			id: patternId,
			name: 'Design',
			icon: 'Image',
			origin: Types.PatternOrigin.BuiltIn,
			propertyIds: properties.map(p => p.getId()),
			slots: [],
			type: Types.PatternType.SyntheticImage
		},
		context
	);

	return {
		pattern,
		properties
	};
};
