"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pbjs_1 = require("../proto-plugin/pbjs");
const ts_poet_1 = require("./ts-poet");
const main_1 = require("./main");
const utils_1 = require("./utils");
const sequency_1 = require("sequency");
const sourceInfo_1 = __importDefault(require("./sourceInfo"));
var FieldDescriptorProto = pbjs_1.google.protobuf.FieldDescriptorProto;
function basicWireType(type) {
    switch (type) {
        case FieldDescriptorProto.Type.TYPE_DOUBLE:
            return 1;
        case FieldDescriptorProto.Type.TYPE_FLOAT:
            return 5;
        case FieldDescriptorProto.Type.TYPE_INT32:
        case FieldDescriptorProto.Type.TYPE_ENUM:
        case FieldDescriptorProto.Type.TYPE_UINT32:
        case FieldDescriptorProto.Type.TYPE_SINT32:
            return 0;
        case FieldDescriptorProto.Type.TYPE_FIXED32:
        case FieldDescriptorProto.Type.TYPE_SFIXED32:
            return 5;
        case FieldDescriptorProto.Type.TYPE_INT64:
        case FieldDescriptorProto.Type.TYPE_UINT64:
        case FieldDescriptorProto.Type.TYPE_SINT64:
            return 0;
        case FieldDescriptorProto.Type.TYPE_FIXED64:
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            return 1;
        case FieldDescriptorProto.Type.TYPE_BOOL:
            return 0;
        case FieldDescriptorProto.Type.TYPE_STRING:
        case FieldDescriptorProto.Type.TYPE_BYTES:
            return 2;
        default:
            throw new Error('Invalid type ' + type);
    }
}
exports.basicWireType = basicWireType;
function basicLongWireType(type) {
    switch (type) {
        case FieldDescriptorProto.Type.TYPE_INT64:
        case FieldDescriptorProto.Type.TYPE_UINT64:
        case FieldDescriptorProto.Type.TYPE_SINT64:
            return 0;
        case FieldDescriptorProto.Type.TYPE_FIXED64:
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            return 1;
        default:
            return undefined;
    }
}
exports.basicLongWireType = basicLongWireType;
function basicTypeName(typeMap, field, options, keepValueType = false) {
    switch (field.type) {
        case FieldDescriptorProto.Type.TYPE_DOUBLE:
        case FieldDescriptorProto.Type.TYPE_FLOAT:
        case FieldDescriptorProto.Type.TYPE_INT32:
        case FieldDescriptorProto.Type.TYPE_UINT32:
        case FieldDescriptorProto.Type.TYPE_SINT32:
        case FieldDescriptorProto.Type.TYPE_FIXED32:
        case FieldDescriptorProto.Type.TYPE_SFIXED32:
            return ts_poet_1.TypeNames.NUMBER;
        case FieldDescriptorProto.Type.TYPE_INT64:
        case FieldDescriptorProto.Type.TYPE_UINT64:
        case FieldDescriptorProto.Type.TYPE_SINT64:
        case FieldDescriptorProto.Type.TYPE_FIXED64:
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            switch (options.forceLong) {
                case main_1.LongOption.LONG:
                    return ts_poet_1.TypeNames.anyType('Long*long');
                case main_1.LongOption.STRING:
                    return ts_poet_1.TypeNames.STRING;
                case main_1.LongOption.NUMBER:
                default:
                    return ts_poet_1.TypeNames.NUMBER;
            }
        case FieldDescriptorProto.Type.TYPE_BOOL:
            return ts_poet_1.TypeNames.BOOLEAN;
        case FieldDescriptorProto.Type.TYPE_STRING:
            return ts_poet_1.TypeNames.STRING;
        case FieldDescriptorProto.Type.TYPE_BYTES:
            return ts_poet_1.TypeNames.anyType('Uint8Array');
        case FieldDescriptorProto.Type.TYPE_MESSAGE:
        case FieldDescriptorProto.Type.TYPE_ENUM:
            return messageToTypeName(typeMap, field.typeName, keepValueType);
        default:
            return ts_poet_1.TypeNames.anyType(field.typeName);
    }
}
exports.basicTypeName = basicTypeName;
function toReaderCall(field) {
    switch (field.type) {
        case FieldDescriptorProto.Type.TYPE_DOUBLE:
            return 'double';
        case FieldDescriptorProto.Type.TYPE_FLOAT:
            return 'float';
        case FieldDescriptorProto.Type.TYPE_INT32:
        case FieldDescriptorProto.Type.TYPE_ENUM:
            return 'int32';
        case FieldDescriptorProto.Type.TYPE_UINT32:
            return 'uint32';
        case FieldDescriptorProto.Type.TYPE_SINT32:
            return 'sint32';
        case FieldDescriptorProto.Type.TYPE_FIXED32:
            return 'fixed32';
        case FieldDescriptorProto.Type.TYPE_SFIXED32:
            return 'sfixed32';
        case FieldDescriptorProto.Type.TYPE_INT64:
            return 'int64';
        case FieldDescriptorProto.Type.TYPE_UINT64:
            return 'uint64';
        case FieldDescriptorProto.Type.TYPE_SINT64:
            return 'sint64';
        case FieldDescriptorProto.Type.TYPE_FIXED64:
            return 'fixed64';
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            return 'sfixed64';
        case FieldDescriptorProto.Type.TYPE_BOOL:
            return 'bool';
        case FieldDescriptorProto.Type.TYPE_STRING:
            return 'string';
        case FieldDescriptorProto.Type.TYPE_BYTES:
            return 'bytes';
        default:
            throw new Error(`Not a primitive field ${field}`);
    }
}
exports.toReaderCall = toReaderCall;
function packedType(type) {
    switch (type) {
        case FieldDescriptorProto.Type.TYPE_DOUBLE:
            return 1;
        case FieldDescriptorProto.Type.TYPE_FLOAT:
            return 5;
        case FieldDescriptorProto.Type.TYPE_INT32:
        case FieldDescriptorProto.Type.TYPE_ENUM:
        case FieldDescriptorProto.Type.TYPE_UINT32:
        case FieldDescriptorProto.Type.TYPE_SINT32:
            return 0;
        case FieldDescriptorProto.Type.TYPE_FIXED32:
        case FieldDescriptorProto.Type.TYPE_SFIXED32:
            return 5;
        case FieldDescriptorProto.Type.TYPE_INT64:
        case FieldDescriptorProto.Type.TYPE_UINT64:
        case FieldDescriptorProto.Type.TYPE_SINT64:
            return 0;
        case FieldDescriptorProto.Type.TYPE_FIXED64:
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            return 1;
        case FieldDescriptorProto.Type.TYPE_BOOL:
            return 0;
        default:
            return undefined;
    }
}
exports.packedType = packedType;
function defaultValue(type, options) {
    switch (type) {
        case FieldDescriptorProto.Type.TYPE_DOUBLE:
        case FieldDescriptorProto.Type.TYPE_FLOAT:
        case FieldDescriptorProto.Type.TYPE_INT32:
        case FieldDescriptorProto.Type.TYPE_ENUM:
        case FieldDescriptorProto.Type.TYPE_UINT32:
        case FieldDescriptorProto.Type.TYPE_SINT32:
        case FieldDescriptorProto.Type.TYPE_FIXED32:
        case FieldDescriptorProto.Type.TYPE_SFIXED32:
            return 0;
        case FieldDescriptorProto.Type.TYPE_UINT64:
        case FieldDescriptorProto.Type.TYPE_FIXED64:
            switch (options.forceLong) {
                case main_1.LongOption.STRING:
                    return '0';
                case main_1.LongOption.LONG:
                    return ts_poet_1.CodeBlock.of('%T.UZERO', 'Long*long');
                case main_1.LongOption.NUMBER:
                default:
                    return 0;
            }
        case FieldDescriptorProto.Type.TYPE_INT64:
        case FieldDescriptorProto.Type.TYPE_SINT64:
        case FieldDescriptorProto.Type.TYPE_SFIXED64:
            switch (options.forceLong) {
                case main_1.LongOption.STRING:
                    return '0';
                case main_1.LongOption.LONG:
                    return ts_poet_1.CodeBlock.of('%T.UZERO', 'Long*long');
                case main_1.LongOption.NUMBER:
                default:
                    return 0;
            }
        case FieldDescriptorProto.Type.TYPE_BOOL:
            return false;
        case FieldDescriptorProto.Type.TYPE_STRING:
            return '""';
        case FieldDescriptorProto.Type.TYPE_BYTES:
        case FieldDescriptorProto.Type.TYPE_MESSAGE:
        default:
            return 'undefined';
    }
}
exports.defaultValue = defaultValue;
function createTypeMap(request, options) {
    const typeMap = new Map();
    for (const file of request.protoFile) {
        const moduleName = file.name.replace('.proto', '');
        function saveMapping(tsFullName, desc, s, protoFullName) {
            const prefix = file.package.length === 0 ? '' : `.${file.package}`;
            typeMap.set(`${prefix}.${protoFullName}`, [moduleName, tsFullName, desc]);
        }
        main_1.visit(file, sourceInfo_1.default.empty(), saveMapping, options, saveMapping);
    }
    return typeMap;
}
exports.createTypeMap = createTypeMap;
function isPrimitive(field) {
    return !isMessage(field);
}
exports.isPrimitive = isPrimitive;
function isBytes(field) {
    return field.type === FieldDescriptorProto.Type.TYPE_BYTES;
}
exports.isBytes = isBytes;
function isMessage(field) {
    return field.type === FieldDescriptorProto.Type.TYPE_MESSAGE;
}
exports.isMessage = isMessage;
function isEnum(field) {
    return field.type === FieldDescriptorProto.Type.TYPE_ENUM;
}
exports.isEnum = isEnum;
function is64BitInteger(field) {
    return (field.type === FieldDescriptorProto.Type.TYPE_FIXED64 ||
        field.type === FieldDescriptorProto.Type.TYPE_UINT64 ||
        field.type === FieldDescriptorProto.Type.TYPE_INT64);
}
exports.is64BitInteger = is64BitInteger;
function isWithinOneOf(field) {
    return field.hasOwnProperty('oneofIndex');
}
exports.isWithinOneOf = isWithinOneOf;
function isRepeated(field) {
    return field.label === FieldDescriptorProto.Label.LABEL_REPEATED;
}
exports.isRepeated = isRepeated;
function isLong(field) {
    return basicLongWireType(field.type) !== undefined;
}
exports.isLong = isLong;
function isMapType(typeMap, messageDesc, field, options) {
    return detectMapType(typeMap, messageDesc, field, options) !== undefined;
}
exports.isMapType = isMapType;
const valueTypes = {};
const mappedTypes = {
    '.google.protobuf.Timestamp': ts_poet_1.TypeNames.DATE
};
function isTimestamp(field) {
    return field.typeName === '.google.protobuf.Timestamp';
}
exports.isTimestamp = isTimestamp;
function isValueType(field) {
    return field.typeName in valueTypes;
}
exports.isValueType = isValueType;
function messageToTypeName(typeMap, protoType, keepValueType = false) {
    if (!keepValueType && protoType in valueTypes) {
        return valueTypes[protoType];
    }
    if (!keepValueType && protoType in mappedTypes) {
        return mappedTypes[protoType];
    }
    const [module, type] = toModuleAndType(typeMap, protoType);
    return ts_poet_1.TypeNames.importedType(`${type}@./${module}`);
}
exports.messageToTypeName = messageToTypeName;
function toModuleAndType(typeMap, protoType) {
    return typeMap.get(protoType) || utils_1.fail(`No type found for ${protoType}`);
}
function toTypeName(typeMap, messageDesc, field, options) {
    let type = basicTypeName(typeMap, field, options, false);
    let isOptional = false;
    if (isRepeated(field)) {
        const mapType = detectMapType(typeMap, messageDesc, field, options);
        if (mapType) {
            const { keyType, valueType } = mapType;
            type = ts_poet_1.TypeNames.anonymousType(new ts_poet_1.Member(`[key: ${keyType}]`, valueType));
        }
        else {
            type = ts_poet_1.TypeNames.arrayType(type);
        }
    }
    else if ((isWithinOneOf(field) || isMessage(field)) && !isValueType(field)) {
        isOptional = true;
    }
    else if (isEnum(field)) {
        isOptional = true;
    }
    else if (field.proto3Optional) {
        isOptional = true;
    }
    return { type, isOptional };
}
exports.toTypeName = toTypeName;
function detectMapType(typeMap, messageDesc, fieldDesc, options) {
    var _a;
    if (fieldDesc.label === FieldDescriptorProto.Label.LABEL_REPEATED &&
        fieldDesc.type === FieldDescriptorProto.Type.TYPE_MESSAGE) {
        const mapType = typeMap.get(fieldDesc.typeName)[2];
        if (!((_a = mapType.options) === null || _a === void 0 ? void 0 : _a.mapEntry))
            return undefined;
        const keyType = toTypeName(typeMap, messageDesc, mapType.field[0], options);
        const valueType = basicTypeName(typeMap, mapType.field[1], options);
        return { messageDesc: mapType, keyType: keyType.type, valueType };
    }
    return undefined;
}
exports.detectMapType = detectMapType;
function getMapValueFieldDesc(typeMap, messageDesc, fieldDesc, options) {
    if (fieldDesc.label === FieldDescriptorProto.Label.LABEL_REPEATED &&
        fieldDesc.type === FieldDescriptorProto.Type.TYPE_MESSAGE) {
        const mapType = typeMap.get(fieldDesc.typeName)[2];
        return mapType.field[1];
    }
    return undefined;
}
exports.getMapValueFieldDesc = getMapValueFieldDesc;
function createOneOfsMap(message) {
    return sequency_1.asSequence(message.field)
        .filter(isWithinOneOf)
        .groupBy(f => {
        return message.oneofDecl[f.oneofIndex].name;
    });
}
