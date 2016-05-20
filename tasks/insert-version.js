#!/usr/bin/env node
const sed = require('shelljs').sed;
const ver = require('../package.json').version;
sed('-i', /version-here/g, `v${ver}`, 'docs/statements.html');
