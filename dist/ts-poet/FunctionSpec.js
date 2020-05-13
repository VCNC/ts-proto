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
const Modifier_1 = require("./Modifier");
const ParameterSpec_1 = require("./ParameterSpec");
const TypeNames_1 = require("./TypeNames");
const CONSTRUCTOR = 'constructor()';
const CALLABLE = 'callable()';
const INDEXABLE = 'indexable()';
var Encloser;
(function (Encloser) {
    Encloser[Encloser["HASH"] = 0] = "HASH";
    Encloser[Encloser["CLASS"] = 1] = "CLASS";
    Encloser[Encloser["INTERFACE"] = 2] = "INTERFACE";
})(Encloser = exports.Encloser || (exports.Encloser = {}));
/** A generated function declaration. */
class FunctionSpec extends ts_imm_1.Imm {
    static create(name) {
        return new FunctionSpec({
            name,
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            decorators: [],
            modifiers: [],
            typeVariables: [],
            returnType: undefined,
            parameters: [],
            restParameter: undefined,
            body: CodeBlock_1.CodeBlock.empty(),
            encloser: undefined,
        });
    }
    static createConstructor() {
        return FunctionSpec.create(CONSTRUCTOR);
    }
    static createCallable() {
        return FunctionSpec.create(CALLABLE);
    }
    static createIndexable() {
        return FunctionSpec.create(INDEXABLE);
    }
    /*
    init {
      require(body.isEmpty() || Modifier.ABSTRACT !in builder.modifiers) {
        "abstract function ${builder.name} cannot have code"
      }
    }
    */
    abstract() {
        return FunctionSpec.create(this.name)
            .addModifiers(Modifier_1.Modifier.ABSTRACT)
            .addTypeVariables(...this.typeVariables)
            .addParameters(...this.parameters);
    }
    parameter(name) {
        return this.parameters.find(it => it.name === name);
    }
    emit(codeWriter, implicitModifiers = []) {
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitDecorators(this.decorators, false);
        codeWriter.emitModifiers(this.modifiers, implicitModifiers);
        this.emitSignature(codeWriter);
        const isEmptyConstructor = this.isConstructor() && this.body.isEmpty();
        if (this.modifiers.includes(Modifier_1.Modifier.ABSTRACT) ||
            implicitModifiers.includes(Modifier_1.Modifier.ABSTRACT) ||
            isEmptyConstructor) {
            codeWriter.emit(';\n');
            return;
        }
        codeWriter.emit(' {\n');
        codeWriter.indent();
        codeWriter.emitCodeBlock(this.body);
        codeWriter.unindent();
        codeWriter.emit('}');
        if (this.encloser !== Encloser.HASH) {
            codeWriter.emit('\n');
        }
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
    addDecorators(...decoratorSpecs) {
        return this.copy({
            decorators: [...this.decorators, ...decoratorSpecs],
        });
    }
    addDecorator(decorator, data) {
        return this.copy({
            decorators: [...this.decorators, DecoratorSpec_1.DecoratorSpec.fromMaybeString(decorator, data)],
        });
    }
    addModifiers(...modifiers) {
        return this.copy({
            modifiers: [...this.modifiers, ...modifiers],
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
    returns(returnType) {
        // check(!name.isConstructor) { "$name cannot have a return type" }
        return this.copy({
            returnType: TypeNames_1.TypeNames.anyTypeMaybeString(returnType),
        });
    }
    addParameters(...parameterSpecs) {
        return this.copy({
            parameters: [...this.parameters, ...parameterSpecs],
        });
    }
    addParameter(parameterSpec, maybeType, maybeData) {
        let param;
        if (typeof parameterSpec === 'string') {
            const name = parameterSpec;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const type = TypeNames_1.TypeNames.anyTypeMaybeString(maybeType);
            const data = maybeData || {};
            param = ParameterSpec_1.ParameterSpec.create(name, type).copy(data);
        }
        else {
            param = parameterSpec;
        }
        return this.copy({
            parameters: [...this.parameters, param],
        });
    }
    rest(parameterSpec, maybeType) {
        let param;
        if (typeof parameterSpec === 'string') {
            const name = parameterSpec;
            const type = TypeNames_1.TypeNames.anyTypeMaybeString(maybeType);
            param = ParameterSpec_1.ParameterSpec.create(name, type);
        }
        else {
            param = parameterSpec;
        }
        return this.copy({
            restParameter: param,
        });
    }
    addCode(format, ...args) {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.add(format, ...args),
        });
    }
    addNamedCode(format, args) {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.addNamed(format, args),
        });
    }
    addCodeBlock(codeBlock) {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.addCode(codeBlock),
        });
    }
    addComment(format, ...args) {
        return this.copy({
            body: this.body.add('// ' + format + '\n', ...args),
        });
    }
    /**
     * @param controlFlow the control flow construct and its code, such as "if (foo == 5)".
     * * Shouldn't contain braces or newline characters.
     */
    beginControlFlow(controlFlow, ...args) {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.beginControlFlow(controlFlow, ...args),
        });
    }
    /**
     * @param controlFlow the control flow construct and its code, such as "else if (foo == 10)".
     * *     Shouldn't contain braces or newline characters.
     */
    nextControlFlow(controlFlow, ...args) {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.nextControlFlow(controlFlow, ...args),
        });
    }
    endControlFlow() {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.endControlFlow(),
        });
    }
    beginLambda(controlFlow, ...args) {
        return this.copy({
            body: this.body.beginLambda(controlFlow, ...args),
        });
    }
    endLambda(closing, ...args) {
        return this.copy({
            body: this.body.endLambda(closing, ...args),
        });
    }
    indent() {
        return this.copy({
            body: this.body.indent(),
        });
    }
    unindent() {
        return this.copy({
            body: this.body.unindent(),
        });
    }
    addStatement(format, ...args) {
        // modifiers -= Modifier.ABSTRACT
        return this.copy({
            body: this.body.addStatement(format, ...args),
        });
    }
    isConstructor() {
        return this.name === CONSTRUCTOR;
    }
    isAccessor() {
        return this.modifiers.indexOf(Modifier_1.Modifier.GET) > -1 || this.modifiers.indexOf(Modifier_1.Modifier.SET) > -1;
    }
    isCallable() {
        return this.name === CALLABLE;
    }
    isIndexable() {
        return this.name === INDEXABLE;
    }
    setEnclosed(encloser) {
        return this.copy({ encloser });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
    emitSignature(codeWriter) {
        if (this.isConstructor()) {
            codeWriter.emitCode('constructor');
        }
        else if (this.isCallable()) {
            codeWriter.emitCode('');
        }
        else if (this.isIndexable()) {
            codeWriter.emitCode('[');
        }
        else {
            if (this.encloser === undefined) {
                codeWriter.emit('function ');
            }
            codeWriter.emitCode('%L', this.name);
        }
        if (this.typeVariables.length > 0) {
            codeWriter.emitTypeVariables(this.typeVariables);
        }
        ParameterSpec_1.ParameterSpec.emitAll(this.parameters, codeWriter, !this.isIndexable(), this.restParameter, undefined);
        if (this.isIndexable()) {
            codeWriter.emitCode(']');
        }
        if (this.returnType !== undefined && this.returnType !== TypeNames_1.TypeNames.VOID) {
            codeWriter.emitCode(': %T', this.returnType);
        }
    }
}
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "decorators", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "typeVariables", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "returnType", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "parameters", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "restParameter", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "body", void 0);
__decorate([
    ts_imm_1.imm
], FunctionSpec.prototype, "encloser", void 0);
exports.FunctionSpec = FunctionSpec;
