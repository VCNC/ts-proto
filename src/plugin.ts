import { promisify } from 'util';
import { optionsFromParameter, readToBuffer } from './utils';
import { google } from '../proto-plugin/pbjs';
import { generateFile } from './main';
import { createTypeMap } from './types';
import CodeGeneratorRequest = google.protobuf.compiler.CodeGeneratorRequest;
import CodeGeneratorResponse = google.protobuf.compiler.CodeGeneratorResponse;
import { FileSpec } from './ts-poet';

// this would be the plugin called by the protoc compiler
async function main() {
  const stdin = await readToBuffer(process.stdin);
  // const json = JSON.parse(stdin.toString());
  // const request = CodeGeneratorRequest.fromObject(json);
  const request = CodeGeneratorRequest.decode(stdin);
  const typeMap = createTypeMap(request, optionsFromParameter(request.parameter));
  const files = request.protoFile
    .filter(file => {
      // ignore google.protobuf package
      // because client deprecation option is added to descriptor in proto file, google/protobuf/descriptor.proto is passed on to this plugin
      // the purpose of import is only for extension, so descriptor.proto does not need to be in the generated file.
      return file.package !== 'google.protobuf' && file.options?.clientDeprecatedFile !== true;
    })
    .map(file => {
      const spec = generateFile(typeMap, file, request.parameter);
      return new CodeGeneratorResponse.File({
        name: spec.path,
        content: prefixDisableLinter(spec)
      });
    });
  const response = new CodeGeneratorResponse({ file: files, supportedFeatures: 1 });
  const buffer = CodeGeneratorResponse.encode(response).finish();
  const write = promisify(process.stdout.write as (buffer: Buffer) => boolean).bind(process.stdout);
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

// Comment block at the top of every source file, since these comments require specific
// syntax incompatible with ts-poet, we will hard-code the string and prepend to the
// generator output.
function prefixDisableLinter(spec: FileSpec): string {
  return `/* eslint-disable */
${spec}`;
}
