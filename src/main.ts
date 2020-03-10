import { EnumSpec, FileSpec, InterfaceSpec, Modifier, PropertySpec, TypeNames } from './ts-poet';
import { google } from '../build/pbjs';
import { detectMapType, toTypeName, TypeMap } from './types';
import SourceInfo, { Fields } from './sourceInfo';
import { maybeAddComment, optionsFromParameter } from './utils';
import { NamespaceSpec } from './ts-poet/NamespaceSpec';
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
    file = file.addEnum(
      generateEnum(enumDesc, nestedSourceInfo, options)
    );
  }

  index = 0;
  for (const message of fileDesc.messageType) {
    const nestedSourceInfo = sourceInfo.open(Fields.file.message_type, index++);
    const [nestedInterfaceSpec, nestedNamespaceSpec] = generateInterfaceDeclaration(typeMap, message, nestedSourceInfo, options)
    file = file.addInterface(nestedInterfaceSpec)
    if (nestedNamespaceSpec != null) {
      file = file.addNamespace(nestedNamespaceSpec)
    }
  }

  return file;
}

function generateEnum(enumDesc: EnumDescriptorProto, sourceInfo: SourceInfo, options: Options): EnumSpec {
  let name = maybeSnakeToCamel(enumDesc.name, options)
  let spec = EnumSpec.create(name).addModifiers(Modifier.CONST, Modifier.EXPORT);
  maybeAddComment(sourceInfo, text => (spec = spec.addJavadoc(text)));

  let index = 0;
  for (const valueDesc of enumDesc.value) {
    const info = sourceInfo.lookup(Fields.enum.value, index++);
    maybeAddComment(info, text => (spec = spec.addJavadoc(`${valueDesc.name} - ${text}\n`)));
    spec = spec.addConstant(valueDesc.name, `"${valueDesc.name}"`);
  }
  return spec;
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
  maybeAddComment(sourceInfo, text => (message = message.addJavadoc(text)));

  let index = 0;
  for (const fieldDesc of messageDesc.field) {
    let prop = PropertySpec.create(
      maybeSnakeToCamel(fieldDesc.name, options),
      toTypeName(typeMap, messageDesc, fieldDesc, options)
    );

    const info = sourceInfo.lookup(Fields.message.field, index++);
    maybeAddComment(info, text => (prop = prop.addJavadoc(text)));

    message = message.addProperty(prop);
  }
  let namespaceSpec: NamespaceSpec | undefined = undefined;
  if (messageDesc.enumType.length !== 0 || messageDesc.nestedType.length !== 0) {
    namespaceSpec = NamespaceSpec.create(messageName)
      .addModifiers(Modifier.EXPORT);

    if (messageDesc.enumType.length !== 0) {
      let index = 0;
      for (const enumDesc of messageDesc.enumType) {
        const nestedSourceInfo = sourceInfo.open(Fields.message.enum_type, index++);
        namespaceSpec = namespaceSpec.addEnum(
          generateEnum(enumDesc, nestedSourceInfo, options)
        );
      }
    }

    if (messageDesc.nestedType.length !== 0) {
      let index = 0;
      for (const nestedMessageDesc of messageDesc.nestedType) {
        const nestedSourceInfo = sourceInfo.open(Fields.message.nested_type, index++);
        const [nestedInterfaceSpec, nestedNamespaceSpec] = generateInterfaceDeclaration(typeMap, nestedMessageDesc, nestedSourceInfo, options)
        namespaceSpec = namespaceSpec.addInterface(nestedInterfaceSpec)
        if (nestedNamespaceSpec != null) {
          namespaceSpec = namespaceSpec.addNamespace(nestedNamespaceSpec)
        }
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

function maybeCastToNumber(
  typeMap: TypeMap,
  messageDesc: DescriptorProto,
  field: FieldDescriptorProto,
  variableName: string,
  options: Options
): string {
  const { keyType } = detectMapType(typeMap, messageDesc, field, options)!;
  if (keyType === TypeNames.STRING) {
    return variableName;
  } else {
    return `Number(${variableName})`;
  }
}
