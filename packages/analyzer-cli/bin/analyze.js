#!/usr/bin/env node
try {
    require('../nccbuild');
} catch (e) {
    // Try to fall back to transpiled code when nccbuild is missing
    if (e.code === 'MODULE_NOT_FOUND' && e.message.includes('../nccbuild')) {
        console.warn('Bundled analyzer-cli missing, falling back to multi file mode');
        require('../lib/bin/analyze');
    }

    throw e;
}
