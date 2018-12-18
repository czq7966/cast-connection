"use strict";

const path = require('path')
const dts = require('dts-bundle');
const dtsDir = path.resolve(__dirname, '../../dist/dts/main')
const entry = "dts.d.ts"
const headerPath =  path.resolve(__dirname, 'header.txt')
const replace = require('replace-in-file');

module.exports = class DtsPlugin {
    constructor(options) {
        this.options = options;
        this.dtsDir = options.dtsDir ? options.dtsDir : dtsDir;
    }
    apply(compiler) {
        compiler.plugin('after-emit', (compilation, callback) => {
            if (compilation.assets) {
                dts.bundle({
                    name: 'module',
                    baseDir: './',
                    main: `${ this.dtsDir }/${ entry }`,
                    out: `./index.d.ts`,
                    outputAsModuleFolder: true,
                    headerPath: headerPath

                });
                //装export 关键字删除，只export ADHOCJSSDK 命名空间
                replace.sync({
                    files: './index.d.ts',
                    from: new RegExp('export ', 'g') ,
                    to: ""
                })
                //将protobuf生成的class类删除，只留接口
                replace.sync({
                    files: './index.d.ts',
                    from: new RegExp('^(class )((?!\n})(.|\n|\r))*(?=\\$protobuf\\.Writer){2}((?!\n})(.|\n|\r))*(\n})$', 'gm'),
                    to: ""
                })                
                replace.sync({
                    files: './index.d.ts',
                    from: 'as namespace',
                    to: "export as namespace"
                })                

                

                callback();
            }
        });
    }
};
