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
const CodeWriter_1 = require("./CodeWriter");
class TypeAliasSpec extends ts_imm_1.Imm {
    static create(name, type) {
        return new TypeAliasSpec({
            name,
            type,
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            modifiers: [],
            typeVariables: [],
        });
    }
    emit(codeWriter) {
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitModifiers(this.modifiers);
        codeWriter.emitCode('type %L', this.name);
        codeWriter.emitTypeVariables(this.typeVariables);
        codeWriter.emitCode(' = %T', this.type);
        codeWriter.emit(';\n');
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
        let curr = this;
        modifiers.forEach(it => {
            curr = curr.addModifier(it);
        });
        return curr;
    }
    addModifier(modifier) {
        return this.copy({
            modifiers: [...this.modifiers, modifier],
        });
    }
    addTypeVariables(...typeVariables) {
        return this.copy({
            typeVariables: [...this.typeVariables, ...typeVariables],
        });
    }
    addTypeVariable(typeVariable) {
        return this.copy({
            typeVariables: [...this.typeVariables, typeVariable],
        });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
}
__decorate([
    ts_imm_1.imm
], TypeAliasSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], TypeAliasSpec.prototype, "type", void 0);
__decorate([
    ts_imm_1.imm
], TypeAliasSpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], TypeAliasSpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], TypeAliasSpec.prototype, "typeVariables", void 0);
exports.TypeAliasSpec = TypeAliasSpec;
