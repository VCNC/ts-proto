import { Any, EnumSpec, FileSpec, FunctionSpec, InterfaceSpec, Modifier, PropertySpec, TypeNames } from './ts-poet';
import { google } from '../build/pbjs';
import {
  basicTypeName,
  detectMapType,
  getMapValueFieldDesc,
  isEnum,
  isMessage,
  isRepeated,
  toTypeName,
  TypeMap
} from './types';
import SourceInfo, { Fields } from './sourceInfo';
import { maybeAddComment, optionsFromParameter } from './utils';
import { NamespaceSpec } from './ts-poet/NamespaceSpec';
import { Imported, ImportsName } from './ts-poet/SymbolSpecs';
import DescriptorProto = google.protobuf.DescriptorProto;
import FieldDescriptorProto = google.protobuf.FieldDescriptorProto;
import FileDescriptorProto = google.protobuf.FileDescriptorProto;
import EnumDescriptorProto = google.protobuf.EnumDescriptorProto;

export type Options = {
  useContext: boolean;
  snakeToCamel: boolean;
  forceLong: boolean;
};

export function generateFile(typeMap: TypeMap, fileDesc: FileDescriptorProto, parameter: string): FileSpec {
  const options = optionsFromParameter(parameter);

  // Google's protofiles are organized like Java, where package == the folder the file
  // is in, and file == a specific service within the package. I.e. you can have multiple
  // company/foo.proto and company/bar.proto files, where package would be 'company'.
  //
  // We'll match that stucture by setting up the module path as:
  //
  // company/foo.proto --> company/foo.ts
  // company/bar.proto --> company/bar.ts
  //
  // We'll also assume that the fileDesc.name is already the `company/foo.proto` path, with
  // the package already implicitly in it, so we won't re-append/strip/etc. it out/back in.
  const moduleName = fileDesc.name.replace('.proto', '.ts');
  let file = FileSpec.create(moduleName);

  const sourceInfo = SourceInfo.fromDescriptor(fileDesc);

  // Syntax, unlike most fields, is not repeated and thus does not use an index
  const headerComment = sourceInfo.lookup(Fields.file.syntax, undefined);
  maybeAddComment(headerComment, text => (file = file.addComment(text)));

  let index = 0;
  for (const enumDesc of fileDesc.enumType) {
    const nestedSourceInfo = sourceInfo.open(Fields.file.enum_type, index++);
    const [enumSpec, enumToJson] = generateEnum(enumDesc, nestedSourceInfo, options)
    file = file.addEnum(enumSpec).addFunction(enumToJson)
  }

  index = 0;
  for (const message of fileDesc.messageType) {
    const nestedSourceInfo = sourceInfo.open(Fields.file.message_type, index++);
    const [nestedInterfaceSpec, nestedNamespaceSpec] = generateInterfaceDeclaration(typeMap, message, nestedSourceInfo, options);
    file = file.addInterface(nestedInterfaceSpec);
    if (nestedNamespaceSpec != null) {
      file = file.addNamespace(nestedNamespaceSpec);
    }
  }

  return file;
}

function generateEnum(enumDesc: EnumDescriptorProto, sourceInfo: SourceInfo, options: Options): [EnumSpec, FunctionSpec] {
  let name = maybeSnakeToCamel(enumDesc.name, options)
  let spec = EnumSpec.create(name).addModifiers(Modifier.CONST, Modifier.EXPORT);
  let toJsonSpec = FunctionSpec.create(name+'_fromString')
    .addModifiers(Modifier.EXPORT)
    .returns(`${name} | undefined`)
    .addParameter('str', 'string')
    .beginControlFlow('switch (str)');
  maybeAddComment(sourceInfo, text => (spec = spec.addJavadoc(text)));

  let index = 0;
  for (const valueDesc of enumDesc.value) {
    const info = sourceInfo.lookup(Fields.enum.value, index++);
    maybeAddComment(info, text => (spec = spec.addJavadoc(`${valueDesc.name} - ${text}\n`)));
    spec = spec.addConstant(valueDesc.name, `"${valueDesc.name}"`);
    toJsonSpec = toJsonSpec.addCode('case %L:\n', name + '.' + valueDesc.name)
  }
  toJsonSpec = toJsonSpec
    .addCode('return str\n')
    .addCode('default: return undefined\n')
    .endControlFlow();
  return [spec, toJsonSpec];
}

// Create the interface with properties
function generateInterfaceDeclaration(
  typeMap: TypeMap,
  messageDesc: DescriptorProto,
  sourceInfo: SourceInfo,
  options: Options
): [InterfaceSpec, NamespaceSpec | undefined] {
  let messageName = maybeSnakeToCamel(messageDesc.name, options);
  let message = InterfaceSpec.create(messageName).addModifiers(Modifier.EXPORT);
  let messageFromJson = FunctionSpec.create('fromJson')
    .addModifiers(Modifier.EXPORT)
    .returns(`${messageName}`)
    .addParameter('obj', 'any')
    .beginControlFlow('return')
    .addCode('...obj,\n');
  maybeAddComment(sourceInfo, text => (message = message.addJavadoc(text)));

  let index = 0;
  for (const fieldDesc of messageDesc.field) {
    let type = toTypeName(typeMap, messageDesc, fieldDesc, options);
    let basicType = basicTypeName(typeMap, fieldDesc, options);
    let fieldName = maybeSnakeToCamel(fieldDesc.name, options);
    let prop = PropertySpec.create(
      fieldName,
      type.type,
      type.isOptional
    );
    const info = sourceInfo.lookup(Fields.message.field, index++);
    maybeAddComment(info, text => (prop = prop.addJavadoc(text)));

    message = message.addProperty(prop);

    // generation for fromJson function
    if (isRepeated(fieldDesc)) {
      const mapType = detectMapType(typeMap, messageDesc, fieldDesc, options);
      if (mapType) {
        const valueFieldDesc = getMapValueFieldDesc(typeMap, messageDesc, fieldDesc, options);
        if (valueFieldDesc != null && (isEnum(valueFieldDesc) || isMessage(valueFieldDesc))) {
          const { keyType, valueType } = mapType;
          messageFromJson = messageFromJson.addCode(`${fieldName}: (() => {\n`)
            .indent()
            .addCode('const ret: any = {}\n')
            .addCode('Object.entries(obj).forEach(([k,v]) => {\n')
            .indent()
            .addCode('ret[k] = ');

          if (isEnum(valueFieldDesc)) {
            const valueAnyType = valueType as Any;
            const importedSymbol = valueAnyType.imported as Imported;
            // symbol and functionType is needed for import.
            const functionSymbol = new ImportsName(importedSymbol.value + '_fromString', importedSymbol.source);
            const functionType = TypeNames.anyType(valueAnyType.usage + "_fromString", functionSymbol);
            messageFromJson = messageFromJson.addCode(`%T(v as string)\n`, functionType)
          } else if (isMessage(valueFieldDesc)) {
            messageFromJson = messageFromJson.addCode(`%T.fromJson(v)\n`, valueType)
          }

          messageFromJson = messageFromJson.unindent()
            .addCode('})\n')
            .addCode('return ret\n')
            .unindent()
            .addCode('})(),\n')
        }
      } else {
        if (isEnum(fieldDesc)) {
          const basicAnyType = basicType as Any;
          const importedSymbol = basicAnyType.imported as Imported;
          // symbol and functionType is needed for import.
          const functionSymbol = new ImportsName(importedSymbol.value + '_fromString', importedSymbol.source);
          const functionType = TypeNames.anyType(basicAnyType.usage + "_fromString", functionSymbol);
          messageFromJson = messageFromJson.addCode(`${fieldName}: obj.${fieldName}.map((v: any) => %T(v)),\n`, functionType)
        } else if (isMessage(fieldDesc)) {
          messageFromJson = messageFromJson.addCode(`${fieldName}: obj.${fieldName}.map((v: any) => %T.fromJson(v)),\n`, basicType)
        }
      }
    } else if (isEnum(fieldDesc) || isMessage(fieldDesc)) {
      if (isEnum(fieldDesc)) {
        const basicAnyType = basicType as Any;
        const importedSymbol = basicAnyType.imported as Imported;
        // symbol and functionType is needed for import.
        const functionSymbol = new ImportsName(importedSymbol.value + '_fromString', importedSymbol.source);
        const functionType = TypeNames.anyType(basicAnyType.usage + "_fromString", functionSymbol);
        messageFromJson = messageFromJson.addCode(`${fieldName}: %T(obj.${fieldName}),\n`, functionType);
      } else if (isMessage(fieldDesc)) {
        messageFromJson = messageFromJson.addCode(`${fieldName}: obj.${fieldName} != null ? %T.fromJson(obj.${fieldName}) : undefined,\n`, basicType)
      }
    }

  }
  messageFromJson = messageFromJson.endControlFlow();
  let namespaceSpec = NamespaceSpec.create(messageName)
    .addModifiers(Modifier.EXPORT);

  namespaceSpec = namespaceSpec.addFunction(messageFromJson);

  if (messageDesc.enumType.length !== 0) {
    let index = 0;
    for (const enumDesc of messageDesc.enumType) {
      const nestedSourceInfo = sourceInfo.open(Fields.message.enum_type, index++);
      const [enumSpec, enumToJson] = generateEnum(enumDesc, nestedSourceInfo, options)
      namespaceSpec = namespaceSpec
        .addEnum(enumSpec)
        .addFunction(enumToJson)
    }
  }

  if (messageDesc.nestedType.length !== 0) {
    let index = 0;
    for (const nestedMessageDesc of messageDesc.nestedType) {
      if (nestedMessageDesc.options?.mapEntry === true) {
        continue;
      }
      const nestedSourceInfo = sourceInfo.open(Fields.message.nested_type, index++);
      const [nestedInterfaceSpec, nestedNamespaceSpec] = generateInterfaceDeclaration(typeMap, nestedMessageDesc, nestedSourceInfo, options)
      namespaceSpec = namespaceSpec.addInterface(nestedInterfaceSpec)
      if (nestedNamespaceSpec != null) {
        namespaceSpec = namespaceSpec.addNamespace(nestedNamespaceSpec)
      }
    }
  }

  return [message, namespaceSpec];
}

type MessageVisitor = (
  fullName: string,
  desc: DescriptorProto,
  sourceInfo: SourceInfo,
  fullProtoTypeName: string
) => void;

type EnumVisitor = (
  fullName: string,
  desc: EnumDescriptorProto,
  sourceInfo: SourceInfo,
  fullProtoTypeName: string
) => void;

export function visit(
  proto: FileDescriptorProto | DescriptorProto,
  sourceInfo: SourceInfo,
  messageFn: MessageVisitor,
  options: Options,
  enumFn: EnumVisitor = () => {},
  tsPrefix: string = '',
  protoPrefix: string = ''
): void {
  const isRootFile = proto instanceof FileDescriptorProto;
  const childEnumType = isRootFile ? Fields.file.enum_type : Fields.message.enum_type;

  let index = 0;
  for (const enumDesc of proto.enumType) {
    // I.e. Foo_Bar.Zaz_Inner
    const protoFullName = protoPrefix + enumDesc.name;
    // I.e. FooBar_ZazInner
    const tsFullName = tsPrefix + maybeSnakeToCamel(enumDesc.name, options);
    const nestedSourceInfo = sourceInfo.open(childEnumType, index++);
    enumFn(tsFullName, enumDesc, nestedSourceInfo, protoFullName);
  }

  const messages = proto instanceof FileDescriptorProto ? proto.messageType : proto.nestedType;
  const childType = isRootFile ? Fields.file.message_type : Fields.message.nested_type;

  index = 0;
  for (const message of messages) {
    // I.e. Foo_Bar.Zaz_Inner
    const protoFullName = protoPrefix + message.name;
    // I.e. FooBar_ZazInner
    const tsFullName = tsPrefix + maybeSnakeToCamel(message.name, options);
    const nestedSourceInfo = sourceInfo.open(childType, index++);
    messageFn(tsFullName, message, nestedSourceInfo, protoFullName);
    visit(message, nestedSourceInfo, messageFn, options, enumFn, tsFullName + '.', protoFullName + '.');
  }
}

function hasSingleRepeatedField(messageDesc: DescriptorProto): boolean {
  return messageDesc.field.length == 1 && messageDesc.field[0].label === FieldDescriptorProto.Label.LABEL_REPEATED;
}

// function generateOneOfProperty(typeMap: TypeMap, name: string, fields: FieldDescriptorProto[]): PropertySpec {
//   const adtType = TypeNames.unionType(
//     ...fields.map(f => {
//       const kind = new Member('field', TypeNames.anyType(`'${f.name}'`), false);
//       const value = new Member('value', toTypeName(typeMap, f), false);
//       return TypeNames.anonymousType(kind, value);
//     })
//   );
//   return PropertySpec.create(snakeToCamel(name), adtType);
// }

function maybeSnakeToCamel(s: string, options: Options): string {
  if (options.snakeToCamel) {
    return s.replace(/(\_\w)/g, m => m[1].toUpperCase());
  } else {
    return s;
  }
}

function capitalize(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substring(1);
}
