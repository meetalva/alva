import { PatternLibrary } from './pattern-library';
import { builtin } from './builtin';
import * as Types from '../../types';

export const builtinPatternLibrary = PatternLibrary.from(builtin as Types.SerializedPatternLibrary);
