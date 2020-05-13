"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_imm_1 = require("ts-imm");
const CodeBlock_1 = require("./CodeBlock");
const InterfaceSpec_1 = require("./InterfaceSpec");
const ClassSpec_1 = require("./ClassSpec");
const EnumSpec_1 = require("./EnumSpec");
const FunctionSpec_1 = require("./FunctionSpec");
const Modifier_1 = require("./Modifier");
const PropertySpec_1 = require("./PropertySpec");
const TypeAliasSpec_1 = require("./TypeAliasSpec");
const utils_1 = require("./utils");
/**
 */
class NamespaceSpec extends ts_imm_1.Imm {
    static create(name) {
        return new NamespaceSpec({
            name,
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            members: [],
            modifiers: [],
        });
    }
    emit(codeWriter) {
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitModifiers(this.modifiers);
        codeWriter.emitCode('namespace %L {\n', this.name);
        codeWriter.indent();
        let isFirst = true;
        this.members
            .forEach(member => {
            if (isFirst) {
                isFirst = false;
            }
            else {
                codeWriter.emit('\n');
            }
            if (member instanceof NamespaceSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof InterfaceSpec_1.InterfaceSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof ClassSpec_1.ClassSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof EnumSpec_1.EnumSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof FunctionSpec_1.FunctionSpec) {
                member.emit(codeWriter, []);
            }
            else if (member instanceof PropertySpec_1.PropertySpec) {
                member.emit(codeWriter, [], true);
            }
            else if (member instanceof TypeAliasSpec_1.TypeAliasSpec) {
                member.emit(codeWriter);
            }
            else if (member instanceof CodeBlock_1.CodeBlock) {
                codeWriter.emitCodeBlock(member);
            }
            else if (member instanceof NamespaceSpec) {
                throw new Error('unhandled');
            }
        });
        codeWriter.unindent();
        codeWriter.emit('}\n');
    }
    addJavadoc(format, ...args) {
        return this.copy({
            javaDoc: this.javaDoc.add(format, ...args),
        });
    }
    addJavadocBlock(block) {
        return this.copy({
            javaDoc: this.javaDoc.addCode(block),
        });
    }
    addModifiers(...modifiers) {
        modifiers.forEach(it => utils_1.check(it === Modifier_1.Modifier.EXPORT || it === Modifier_1.Modifier.DECLARE || it === Modifier_1.Modifier.CONST));
        modifiers.forEach(m => this.modifiers.push(m));
        return this;
    }
    addClass(classSpec) {
        return this.copy({
            members: [...this.members, classSpec],
        });
    }
    addInterface(ifaceSpec) {
        return this.copy({
            members: [...this.members, ifaceSpec],
        });
    }
    addEnum(enumSpec) {
        return this.copy({
            members: [...this.members, enumSpec],
        });
    }
    addFunction(functionSpec) {
        return this.copy({
            members: [...this.members, functionSpec],
        });
    }
    addProperty(propertySpec) {
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
}
__decorate([
    ts_imm_1.imm
], NamespaceSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], NamespaceSpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], NamespaceSpec.prototype, "members", void 0);
__decorate([
    ts_imm_1.imm
], NamespaceSpec.prototype, "modifiers", void 0);
exports.NamespaceSpec = NamespaceSpec;
