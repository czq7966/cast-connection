const path = require('path')
const dts = require('dts-bundle');
const dtsDir = path.resolve(__dirname, '../../dist/dts/src/main')
const entry = "dts.d.ts"
const headerPath =  path.resolve(__dirname, 'header.txt')

dts.bundle({
    name: 'index',
    baseDir: './',
    main: `${ dtsDir }/${ entry }`,
    // out: `${ directory }/${ filename }.d.ts`,
    outputAsModuleFolder: true,
    headerPath: headerPath

    // This option sometimes remove node_modules/typescript/lib/*. That's why we do it manually.
    // removeSource: true
});