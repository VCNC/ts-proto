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
const DecoratorSpec_1 = require("./DecoratorSpec");
class ParameterSpec extends ts_imm_1.Imm {
    static create(name, type, optional = false, ...modifiers) {
        return new ParameterSpec({
            name,
            type,
            optional,
            decorators: [],
            modifiers,
            defaultValueField: undefined,
        });
    }
    static emitAll(parameters, codeWriter, enclosed, rest, emitFn) {
        const emitFn2 = emitFn || ((p, r) => p.emit(codeWriter, true, r));
        const params = parameters.concat(rest !== undefined ? [rest] : []);
        if (enclosed) {
            codeWriter.emit('(');
        }
        if (params.length <= 5) {
            let index = 0;
            params.forEach(parameter => {
                if (index > 0) {
                    codeWriter.emit(', ');
                }
                emitFn2(parameter, rest === parameter);
                index++;
            });
        }
        else {
            codeWriter.emit('\n').indent(2);
            let index = 0;
            params.forEach(parameter => {
                if (index > 0) {
                    codeWriter.emit(',\n');
                }
                emitFn2(parameter, rest === parameter);
                index++;
            });
            codeWriter.unindent(2).emit('\n');
        }
        if (enclosed) {
            codeWriter.emit(')');
        }
    }
    emit(codeWriter, includeType = true, isRest = false) {
        codeWriter.emitDecorators(this.decorators, true);
        codeWriter.emitModifiers(this.modifiers);
        if (isRest) {
            codeWriter.emitCode('...');
        }
        codeWriter.emitCode('%L', this.name);
        if (this.optional) {
            codeWriter.emitCode('?');
        }
        if (includeType) {
            codeWriter.emitCode(': %T', this.type);
        }
        this.emitDefaultValue(codeWriter);
    }
    emitDefaultValue(codeWriter) {
        if (this.defaultValueField) {
            codeWriter.emitCode(' = %[%L%]', this.defaultValueField);
        }
    }
    addDecorators(...decoratorSpecs) {
        return this.copy({
            decorators: [...this.decorators, ...decoratorSpecs],
        });
    }
    addDecorator(decoratorSpec) {
        const decorator = DecoratorSpec_1.DecoratorSpec.fromMaybeString(decoratorSpec);
        return this.copy({
            decorators: [...this.decorators, decorator],
        });
    }
    addModifiers(...modifiers) {
        return this.copy({
            modifiers: [...this.modifiers, ...modifiers],
        });
    }
    defaultValue(format, ...args) {
        return this.defaultValueBlock(CodeBlock_1.CodeBlock.of(format, ...args));
    }
    defaultValueBlock(codeBlock) {
        return this.copy({
            defaultValueField: codeBlock,
        });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
}
__decorate([
    ts_imm_1.imm
], ParameterSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], ParameterSpec.prototype, "type", void 0);
__decorate([
    ts_imm_1.imm
], ParameterSpec.prototype, "optional", void 0);
__decorate([
    ts_imm_1.imm
], ParameterSpec.prototype, "decorators", void 0);
__decorate([
    ts_imm_1.imm
], ParameterSpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], ParameterSpec.prototype, "defaultValueField", void 0);
exports.ParameterSpec = ParameterSpec;
