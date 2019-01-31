import { analysis } from '@meetalva/essentials';
import { PatternLibrary } from './pattern-library';
import * as Types from '@meetalva/types';

export const builtinPatternLibrary = PatternLibrary.from(
	(analysis as unknown) as Types.SerializedPatternLibrary
);
