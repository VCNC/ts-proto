"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const utils_1 = require("./utils");
const pbjs_1 = require("../proto-plugin/pbjs");
const main_1 = require("./main");
const types_1 = require("./types");
var CodeGeneratorRequest = pbjs_1.google.protobuf.compiler.CodeGeneratorRequest;
var CodeGeneratorResponse = pbjs_1.google.protobuf.compiler.CodeGeneratorResponse;
async function main() {
    const stdin = await utils_1.readToBuffer(process.stdin);
    const request = CodeGeneratorRequest.decode(stdin);
    const typeMap = types_1.createTypeMap(request, utils_1.optionsFromParameter(request.parameter));
    const files = request.protoFile
        .filter(file => {
        var _a;
        return file.package !== 'google.protobuf' && ((_a = file.options) === null || _a === void 0 ? void 0 : _a.clientDeprecatedFile) !== true;
    })
        .map(file => {
        const spec = main_1.generateFile(typeMap, file, request.parameter);
        return new CodeGeneratorResponse.File({
            name: spec.path,
            content: prefixDisableLinter(spec)
        });
    });
    const response = new CodeGeneratorResponse({ file: files, supportedFeatures: 1 });
    const buffer = CodeGeneratorResponse.encode(response).finish();
    const write = util_1.promisify(process.stdout.write).bind(process.stdout);
    await write(Buffer.from(buffer));
}
main()
    .then(() => {
    process.stderr.write('DONE');
    process.exit(0);
})
    .catch(e => {
    process.stderr.write('FAILED!');
    process.stderr.write(e.message);
    process.stderr.write(e.stack);
    process.exit(1);
});
function prefixDisableLinter(spec) {
    return `/* eslint-disable */
${spec}`;
}
