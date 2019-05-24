#!/usr/bin/env node
try {
    require('../nccbuild');
} catch (e) {
    require('../lib/bin/analyze');
}
