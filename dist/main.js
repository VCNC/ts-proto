"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_poet_1 = require("./ts-poet");
const pbjs_1 = require("../proto-plugin/pbjs");
const types_1 = require("./types");
const sourceInfo_1 = __importStar(require("./sourceInfo"));
const utils_1 = require("./utils");
const NamespaceSpec_1 = require("./ts-poet/NamespaceSpec");
const SymbolSpecs_1 = require("./ts-poet/SymbolSpecs");
var FieldDescriptorProto = pbjs_1.google.protobuf.FieldDescriptorProto;
var FileDescriptorProto = pbjs_1.google.protobuf.FileDescriptorProto;
function generateFile(typeMap, fileDesc, parameter) {
    const options = utils_1.optionsFromParameter(parameter);
    const moduleName = fileDesc.name.replace('.proto', '.ts');
    let file = ts_poet_1.FileSpec.create(moduleName);
    const sourceInfo = sourceInfo_1.default.fromDescriptor(fileDesc);
    const headerComment = sourceInfo.lookup(sourceInfo_1.Fields.file.syntax, undefined);
    utils_1.maybeAddComment(headerComment, text => (file = file.addComment(text)));
    let index = 0;
    for (const enumDesc of fileDesc.enumType) {
        const nestedSourceInfo = sourceInfo.open(sourceInfo_1.Fields.file.enum_type, index++);
        const enumGenerated = generateEnum(enumDesc, nestedSourceInfo, options);
        if (enumGenerated == null) {
            continue;
        }
        const [enumSpec, enumToJson] = enumGenerated;
        file = file.addTypeAlias(enumSpec).addFunction(enumToJson);
    }
    index = 0;
    for (const message of fileDesc.messageType) {
        const nestedSourceInfo = sourceInfo.open(sourceInfo_1.Fields.file.message_type, index++);
        const nestedInterfaceGenerated = generateInterfaceDeclaration(typeMap, message, nestedSourceInfo, options);
        if (nestedInterfaceGenerated == null) {
            continue;
        }
        const [nestedInterfaceSpec, nestedNamespaceSpec] = nestedInterfaceGenerated;
        file = file.addInterface(nestedInterfaceSpec);
        if (nestedNamespaceSpec != null) {
            file = file.addNamespace(nestedNamespaceSpec);
        }
    }
    return file;
}
exports.generateFile = generateFile;
function generateEnum(enumDesc, sourceInfo, options) {
    var _a, _b;
    if (((_a = enumDesc.options) === null || _a === void 0 ? void 0 : _a.clientDeprecatedEnum) === true) {
        return undefined;
    }
    let name = maybeSnakeToCamel(enumDesc.name, options);
    let enumTypeNames = [];
    let javaDocs = [];
    let toJsonSpec = ts_poet_1.FunctionSpec.create(name + '_fromString')
        .addModifiers(ts_poet_1.Modifier.EXPORT)
        .returns(`${name} | undefined`)
        .addParameter('str', 'string')
        .beginControlFlow('switch (str)');
    utils_1.maybeAddComment(sourceInfo, text => (javaDocs.push(ts_poet_1.CodeBlock.of(text + '\n'))));
    let index = 0;
    for (const valueDesc of enumDesc.value) {
        if (((_b = valueDesc.options) === null || _b === void 0 ? void 0 : _b.clientDeprecatedEnumValue) === true) {
            index++;
            continue;
        }
        const info = sourceInfo.lookup(sourceInfo_1.Fields.enum.value, index++);
        let javaDoc = undefined;
        utils_1.maybeAddComment(info, text => (javaDoc = text));
        enumTypeNames.push(valueDesc.name);
        if (javaDoc != null) {
            javaDocs.push(ts_poet_1.CodeBlock.of(`${valueDesc.name} : \n%>` + javaDoc + '%<'));
        }
        toJsonSpec = toJsonSpec.addCode('case %S:\n', valueDesc.name);
    }
    toJsonSpec = toJsonSpec
        .addCode('return str\n')
        .addCode('default: return undefined\n')
        .endControlFlow();
    let spec = ts_poet_1.TypeAliasSpec.create(name, ts_poet_1.TypeNames.unionType(...enumTypeNames));
    for (const doc of javaDocs) {
        spec = spec.addJavadocBlock(doc);
    }
    return [spec, toJsonSpec];
}
function generateInterfaceDeclaration(typeMap, messageDesc, sourceInfo, options) {
    var _a, _b, _c;
    if (((_a = messageDesc === null || messageDesc === void 0 ? void 0 : messageDesc.options) === null || _a === void 0 ? void 0 : _a.clientDeprecatedMessage) === true) {
        return undefined;
    }
    let messageName = maybeSnakeToCamel(messageDesc.name, options);
    let message = ts_poet_1.InterfaceSpec.create(messageName).addModifiers(ts_poet_1.Modifier.EXPORT);
    let messageFromObject = ts_poet_1.FunctionSpec.create('fromObject')
        .addModifiers(ts_poet_1.Modifier.EXPORT)
        .returns(`${messageName}`)
        .addParameter('obj', 'any')
        .beginControlFlow('return')
        .addCode('...obj,\n');
    utils_1.maybeAddComment(sourceInfo, text => (message = message.addJavadoc(text)));
    let index = 0;
    for (const fieldDesc of messageDesc.field) {
        if (((_b = fieldDesc.options) === null || _b === void 0 ? void 0 : _b.clientDeprecatedField) === true) {
            continue;
        }
        let type = types_1.toTypeName(typeMap, messageDesc, fieldDesc, options);
        let basicType = types_1.basicTypeName(typeMap, fieldDesc, options);
        let fieldName = maybeSnakeToCamel(fieldDesc.name, options);
        let prop = ts_poet_1.PropertySpec.create(fieldName, type.type, type.isOptional);
        if (fieldDesc.oneofIndex != null) {
            let oneOfName = messageDesc.oneofDecl[fieldDesc.oneofIndex].name;
            prop = prop.addJavadoc(`OneOf-${oneOfName}\n`);
        }
        const info = sourceInfo.lookup(sourceInfo_1.Fields.message.field, index++);
        utils_1.maybeAddComment(info, text => (prop = prop.addJavadoc(text)));
        message = message.addProperty(prop);
        if (types_1.isRepeated(fieldDesc)) {
            const mapType = types_1.detectMapType(typeMap, messageDesc, fieldDesc, options);
            if (mapType) {
                const valueFieldDesc = types_1.getMapValueFieldDesc(typeMap, messageDesc, fieldDesc, options);
                if (valueFieldDesc != null && (types_1.isEnum(valueFieldDesc) || types_1.isMessage(valueFieldDesc) || types_1.is64BitInteger(valueFieldDesc))) {
                    const { keyType, valueType } = mapType;
                    messageFromObject = messageFromObject.addCode(`${fieldName}: (() => {\n`)
                        .indent()
                        .addCode('const ret: any = {}\n')
                        .addCode('Object.entries(obj).forEach(([k,v]) => {\n')
                        .indent()
                        .addCode('ret[k] = ');
                    if (types_1.isEnum(valueFieldDesc)) {
                        const valueAnyType = valueType;
                        const importedSymbol = valueAnyType.imported;
                        const functionSymbol = new SymbolSpecs_1.ImportsName(importedSymbol.value + '_fromString', importedSymbol.source);
                        const functionType = ts_poet_1.TypeNames.anyType(valueAnyType.usage + "_fromString", functionSymbol);
                        messageFromObject = messageFromObject.addCode(`%T(v as string)\n`, functionType);
                    }
                    else if (types_1.isMessage(valueFieldDesc)) {
                        messageFromObject = messageFromObject.addCode(`%T.fromObject(v)\n`, valueType);
                    }
                    else if (types_1.is64BitInteger(valueFieldDesc)) {
                        messageFromObject = messageFromObject.addCode(`parseInt(v as string)\n`);
                    }
                    messageFromObject = messageFromObject.unindent()
                        .addCode('})\n')
                        .addCode('return ret\n')
                        .unindent()
                        .addCode('})(),\n');
                }
            }
            else {
                if (types_1.isEnum(fieldDesc)) {
                    const basicAnyType = basicType;
                    const importedSymbol = basicAnyType.imported;
                    const functionSymbol = new SymbolSpecs_1.ImportsName(importedSymbol.value + '_fromString', importedSymbol.source);
                    const functionType = ts_poet_1.TypeNames.anyType(basicAnyType.usage + "_fromString", functionSymbol);
                    messageFromObject = messageFromObject.addCode(`${fieldName}: obj.${fieldName}.map((v: any) => %T(v)),\n`, functionType);
                }
                else if (types_1.isMessage(fieldDesc)) {
                    messageFromObject = messageFromObject.addCode(`${fieldName}: obj.${fieldName}.map((v: any) => %T.fromObject(v)),\n`, basicType);
                }
                else if (types_1.is64BitInteger(fieldDesc)) {
                    messageFromObject = messageFromObject.addCode(`${fieldName}: obj.${fieldName}.map((v: string) => parseInt(v)),\n`, basicType);
                }
            }
        }
        else if (types_1.isEnum(fieldDesc) || types_1.isMessage(fieldDesc) || types_1.is64BitInteger(fieldDesc)) {
            if (types_1.isEnum(fieldDesc)) {
                const basicAnyType = basicType;
                const importedSymbol = basicAnyType.imported;
                const functionSymbol = new SymbolSpecs_1.ImportsName(importedSymbol.value + '_fromString', importedSymbol.source);
                const functionType = ts_poet_1.TypeNames.anyType(basicAnyType.usage + "_fromString", functionSymbol);
                messageFromObject = messageFromObject.addCode(`${fieldName}: %T(obj.${fieldName}),\n`, functionType);
            }
            else if (types_1.isMessage(fieldDesc)) {
                messageFromObject = messageFromObject.addCode(`${fieldName}: obj.${fieldName} != null ? %T.fromObject(obj.${fieldName}) : undefined,\n`, basicType);
            }
            else if (types_1.is64BitInteger(fieldDesc)) {
                messageFromObject = messageFromObject.addCode(`${fieldName}: parseInt(obj.${fieldName}),\n`);
            }
        }
    }
    messageFromObject = messageFromObject.endControlFlow();
    let namespaceSpec = NamespaceSpec_1.NamespaceSpec.create(messageName)
        .addModifiers(ts_poet_1.Modifier.EXPORT);
    namespaceSpec = namespaceSpec.addFunction(messageFromObject);
    if (messageDesc.enumType.length !== 0) {
        let index = 0;
        for (const enumDesc of messageDesc.enumType) {
            const nestedSourceInfo = sourceInfo.open(sourceInfo_1.Fields.message.enum_type, index++);
            const enumGenerated = generateEnum(enumDesc, nestedSourceInfo, options);
            if (enumGenerated == null) {
                continue;
            }
            const [enumSpec, enumToJson] = enumGenerated;
            namespaceSpec = namespaceSpec
                .addTypeAlias(enumSpec)
                .addFunction(enumToJson);
        }
    }
    if (messageDesc.nestedType.length !== 0) {
        let index = 0;
        for (const nestedMessageDesc of messageDesc.nestedType) {
            if (((_c = nestedMessageDesc.options) === null || _c === void 0 ? void 0 : _c.mapEntry) === true) {
                continue;
            }
            const nestedSourceInfo = sourceInfo.open(sourceInfo_1.Fields.message.nested_type, index++);
            const nestedInterfaceGenerated = generateInterfaceDeclaration(typeMap, nestedMessageDesc, nestedSourceInfo, options);
            if (nestedInterfaceGenerated == null) {
                continue;
            }
            const [nestedInterfaceSpec, nestedNamespaceSpec] = nestedInterfaceGenerated;
            namespaceSpec = namespaceSpec.addInterface(nestedInterfaceSpec);
            if (nestedNamespaceSpec != null) {
                namespaceSpec = namespaceSpec.addNamespace(nestedNamespaceSpec);
            }
        }
    }
    return [message, namespaceSpec];
}
function visit(proto, sourceInfo, messageFn, options, enumFn = () => { }, tsPrefix = '', protoPrefix = '') {
    const isRootFile = proto instanceof FileDescriptorProto;
    const childEnumType = isRootFile ? sourceInfo_1.Fields.file.enum_type : sourceInfo_1.Fields.message.enum_type;
    let index = 0;
    for (const enumDesc of proto.enumType) {
        const protoFullName = protoPrefix + enumDesc.name;
        const tsFullName = tsPrefix + maybeSnakeToCamel(enumDesc.name, options);
        const nestedSourceInfo = sourceInfo.open(childEnumType, index++);
        enumFn(tsFullName, enumDesc, nestedSourceInfo, protoFullName);
    }
    const messages = proto instanceof FileDescriptorProto ? proto.messageType : proto.nestedType;
    const childType = isRootFile ? sourceInfo_1.Fields.file.message_type : sourceInfo_1.Fields.message.nested_type;
    index = 0;
    for (const message of messages) {
        const protoFullName = protoPrefix + message.name;
        const tsFullName = tsPrefix + maybeSnakeToCamel(message.name, options);
        const nestedSourceInfo = sourceInfo.open(childType, index++);
        messageFn(tsFullName, message, nestedSourceInfo, protoFullName);
        visit(message, nestedSourceInfo, messageFn, options, enumFn, tsFullName + '.', protoFullName + '.');
    }
}
exports.visit = visit;
function hasSingleRepeatedField(messageDesc) {
    return messageDesc.field.length == 1 && messageDesc.field[0].label === FieldDescriptorProto.Label.LABEL_REPEATED;
}
function maybeSnakeToCamel(s, options) {
    if (options.snakeToCamel) {
        return s.replace(/(\_\w)/g, m => m[1].toUpperCase());
    }
    else {
        return s;
    }
}
function capitalize(s) {
    return s.substring(0, 1).toUpperCase() + s.substring(1);
}
