import * as Types from '../types';

/**
 * Fallback host implementing functionalites that
 * may not be available without Electron by using browser features directly
 */
export class FallbackHost implements Partial<Types.Host> {}
