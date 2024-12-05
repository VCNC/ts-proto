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
const SymbolSpecs_1 = require("./SymbolSpecs");
class DecoratorSpec extends ts_imm_1.Imm {
    static create(name) {
        return new DecoratorSpec({
            name: SymbolSpecs_1.SymbolSpec.fromMaybeString(name),
            parameters: [],
            factory: false,
        });
    }
    static fromMaybeString(decorator, data) {
        return (typeof decorator === 'string' || decorator instanceof SymbolSpecs_1.SymbolSpec
            ? DecoratorSpec.create(decorator)
            : decorator).copy(data || {});
    }
    emit(codeWriter, inline = false, asParameter = false) {
        codeWriter.emitCode('@%N', this.name);
        if (this.parameters.length > 0) {
            codeWriter.emit('(');
            if (!inline) {
                codeWriter.indent();
                codeWriter.emit('\n');
            }
            let index = 0;
            this.parameters.forEach(([first, second]) => {
                if (index > 0 && index < this.parameters.length) {
                    codeWriter.emit(',');
                    codeWriter.emit(inline ? ' ' : '\n');
                }
                if (!asParameter && first !== undefined) {
                    codeWriter.emit(`/* ${first} */ `);
                }
                codeWriter.emitCodeBlock(second);
                index++;
            });
            if (!inline) {
                codeWriter.unindent();
                codeWriter.emit('\n');
            }
            codeWriter.emit(')');
        }
        else if (this.factory) {
            codeWriter.emit('()');
        }
    }
    asFactory() {
        return this.copy({
            factory: true,
        });
    }
    addParameter(name, format, ...args) {
        return this.copy({
            parameters: [...this.parameters, [name, CodeBlock_1.CodeBlock.of(format, args)]],
        });
    }
    addParameterBlock(name, codeBlock) {
        return this.copy({
            parameters: [...this.parameters, [name, codeBlock]],
        });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
}
__decorate([
    ts_imm_1.imm
], DecoratorSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], DecoratorSpec.prototype, "parameters", void 0);
__decorate([
    ts_imm_1.imm
], DecoratorSpec.prototype, "factory", void 0);
exports.DecoratorSpec = DecoratorSpec;
