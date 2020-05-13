"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_imm_1 = require("ts-imm");
const ClassSpec_1 = require("./ClassSpec");
const CodeBlock_1 = require("./CodeBlock");
const CodeWriter_1 = require("./CodeWriter");
const EnumSpec_1 = require("./EnumSpec");
const FunctionSpec_1 = require("./FunctionSpec");
const InterfaceSpec_1 = require("./InterfaceSpec");
const Modifier_1 = require("./Modifier");
const PropertySpec_1 = require("./PropertySpec");
const StringBuffer_1 = require("./StringBuffer");
const SymbolSpecs_1 = require("./SymbolSpecs");
const TypeAliasSpec_1 = require("./TypeAliasSpec");
const TypeNames_1 = require("./TypeNames");
const utils_1 = require("./utils");
const NamespaceSpec_1 = require("./NamespaceSpec");
class FileSpec extends ts_imm_1.Imm {
    static create(file) {
        return new FileSpec({
            path: file,
            comment: CodeBlock_1.CodeBlock.empty(),
            members: [],
            indentField: '  ',
        });
    }
    exportType(typeName) {
        const typeNameParts = typeName.split('.');
        const en = this.exportNamed(typeNameParts[0]);
        return en === undefined ? en : TypeNames_1.TypeNames.anyType(typeName, en);
    }
    exportNamed(symbolName) {
        const first = this.members
            .map(it => {
            if (it instanceof ClassSpec_1.ClassSpec) {
                return it.name;
            }
            else if (it instanceof InterfaceSpec_1.InterfaceSpec) {
                return it.name;
            }
            else if (it instanceof EnumSpec_1.EnumSpec) {
                return it.name;
            }
            else if (it instanceof FunctionSpec_1.FunctionSpec) {
                return it.name;
            }
            else if (it instanceof PropertySpec_1.PropertySpec) {
                return it.name;
            }
            else if (it instanceof TypeAliasSpec_1.TypeAliasSpec) {
                return it.name;
            }
            else if (it instanceof NamespaceSpec_1.NamespaceSpec) {
                return it.name;
            }
            else {
                throw new Error('unrecognized member type');
            }
        })
            .filter(name => name === symbolName)[0];
        return first ? SymbolSpecs_1.SymbolSpecs.importsName(symbolName, '!' + this.path) : undefined;
    }
    exportAll(localName) {
        return SymbolSpecs_1.SymbolSpecs.importsAll(localName, '!' + this.path);
    }
    emit(out) {
        const importsCollector = new CodeWriter_1.CodeWriter(new StringBuffer_1.StringBuffer(), this.indentField);
        this.emitToWriter(importsCollector);
        const requiredImports = importsCollector.requiredImports();
        const codeWriter = new CodeWriter_1.CodeWriter(out, this.indentField, new Set(requiredImports));
        this.emitToWriter(codeWriter);
    }
    isEmpty() {
        return this.members.length === 0;
    }
    isNotEmpty() {
        return !this.isEmpty();
    }
    addComment(format, ...args) {
        return this.copy({
            comment: this.comment.add(format, ...args),
        });
    }
    addClass(classSpec) {
        checkMemberModifiers(classSpec.modifiers);
        return this.copy({
            members: [...this.members, classSpec],
        });
    }
    addInterface(ifaceSpec) {
        checkMemberModifiers(ifaceSpec.modifiers);
        return this.copy({
            members: [...this.members, ifaceSpec],
        });
    }
    addEnum(enumSpec) {
        checkMemberModifiers(enumSpec.modifiers);
        return this.copy({
            members: [...this.members, enumSpec],
        });
    }
    addFunction(functionSpec) {
        checkMemberModifiers(functionSpec.modifiers);
        return this.copy({
            members: [...this.members, functionSpec],
        });
    }
    addProperty(propertySpec) {
        checkMemberModifiers(propertySpec.modifiers);
        return this.copy({
            members: [...this.members, propertySpec],
        });
    }
    addTypeAlias(typeAliasSpec) {
        return this.copy({
            members: [...this.members, typeAliasSpec],
        });
    }
    addCode(codeBlock) {
        return this.copy({
            members: [...this.members, codeBlock],
        });
    }
    addNamespace(namespaceSpec) {
        return this.copy({
            members: [...this.members, namespaceSpec],
        });
    }
    indent(indent) {
        return this.copy({
            indentField: indent,
        });
    }
    toString() {
        const out = new StringBuffer_1.StringBuffer();
        this.emit(out);
        return out.toString();
    }
    emitToWriter(codeWriter) {
        if (this.comment.isNotEmpty()) {
            codeWriter.emitComment(this.comment);
        }
        codeWriter.emitImports(this.path.replace(/\.tsx?$/, ''));
        this.members
            .filter(it => !(it instanceof CodeBlock_1.CodeBlock))
            .forEach(member => {
            codeWriter.emit('\n');
            if (member instanceof InterfaceSpec_1.InterfaceSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof ClassSpec_1.ClassSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof EnumSpec_1.EnumSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof FunctionSpec_1.FunctionSpec) {
                member.emit(codeWriter, [Modifier_1.Modifier.PUBLIC]);
            }
            else if (member instanceof PropertySpec_1.PropertySpec) {
                member.emit(codeWriter, [Modifier_1.Modifier.PUBLIC], true);
            }
            else if (member instanceof TypeAliasSpec_1.TypeAliasSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof CodeBlock_1.CodeBlock) {
                codeWriter.emitCodeBlock(member);
            }
            else if (member instanceof NamespaceSpec_1.NamespaceSpec) {
                member.emit(codeWriter);
            }
            else {
                throw new Error('unhandled');
            }
        });
        utils_1.filterInstances(this.members, CodeBlock_1.CodeBlock).forEach(member => {
            codeWriter.emit('\n');
            codeWriter.emitCodeBlock(member);
        });
    }
}
__decorate([
    ts_imm_1.imm
], FileSpec.prototype, "path", void 0);
__decorate([
    ts_imm_1.imm
], FileSpec.prototype, "comment", void 0);
__decorate([
    ts_imm_1.imm
], FileSpec.prototype, "members", void 0);
__decorate([
    ts_imm_1.imm
], FileSpec.prototype, "indentField", void 0);
exports.FileSpec = FileSpec;
function checkMemberModifiers(modifiers) {
}
