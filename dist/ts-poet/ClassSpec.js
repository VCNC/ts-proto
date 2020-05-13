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
const FunctionSpec_1 = require("./FunctionSpec");
const Modifier_1 = require("./Modifier");
const ParameterSpec_1 = require("./ParameterSpec");
const PropertySpec_1 = require("./PropertySpec");
const TypeNames_1 = require("./TypeNames");
/** A generated `class` declaration. */
class ClassSpec extends ts_imm_1.Imm {
    static create(name) {
        return new ClassSpec({
            name: typeof name === 'string' ? name : name.reference(),
            javaDoc: CodeBlock_1.CodeBlock.empty(),
            decorators: [],
            modifiers: [],
            typeVariables: [],
            superClassField: undefined,
            interfaces: [],
            propertySpecs: [],
            constructorField: undefined,
            functionSpecs: [],
        });
    }
    emit(codeWriter) {
        const constructorProperties = this.constructorProperties();
        codeWriter.emitJavaDoc(this.javaDoc);
        codeWriter.emitDecorators(this.decorators, false);
        codeWriter.emitModifiers(this.modifiers, [Modifier_1.Modifier.PUBLIC]);
        codeWriter.emit('class');
        codeWriter.emitCode(' %L', this.name);
        codeWriter.emitTypeVariables(this.typeVariables);
        const sc = this.superClassField ? CodeBlock_1.CodeBlock.of('extends %T', this.superClassField) : CodeBlock_1.CodeBlock.empty();
        const interfaces = CodeBlock_1.CodeBlock.joinToCode(this.interfaces.map(it => CodeBlock_1.CodeBlock.of('%T', it)), ', ', 'implements ');
        if (sc.isNotEmpty() && interfaces.isNotEmpty()) {
            codeWriter.emitCode(' %L %L', sc, interfaces);
        }
        else if (sc.isNotEmpty() || interfaces.isNotEmpty()) {
            codeWriter.emitCode(' %L%L', sc, interfaces);
        }
        codeWriter.emit(' {\n');
        codeWriter.indent();
        // Non-static properties.
        this.propertySpecs.forEach(propertySpec => {
            if (!constructorProperties.has(propertySpec.name)) {
                codeWriter.emit('\n');
                propertySpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC], true);
            }
        });
        // Write the constructor manually, allowing the replacement
        // of property specs with constructor parameters
        if (this.constructorField) {
            codeWriter.emit('\n');
            const it = this.constructorField;
            if (it.decorators.length > 0) {
                codeWriter.emit(' ');
                codeWriter.emitDecorators(it.decorators, true);
                codeWriter.emit('\n');
            }
            if (it.modifiers.length > 0) {
                codeWriter.emitModifiers(it.modifiers);
            }
            codeWriter.emit('constructor');
            let body = it.body;
            // Emit constructor parameters & property specs that can be replaced with parameters
            ParameterSpec_1.ParameterSpec.emitAll(it.parameters, codeWriter, true, it.restParameter, (param, isRest) => {
                let property = constructorProperties.get(param.name);
                if (property && !isRest) {
                    // Ensure the parameter always has a modifier (that makes it a property in TS)
                    if (!property.modifiers.find(m => [Modifier_1.Modifier.PUBLIC, Modifier_1.Modifier.PRIVATE, Modifier_1.Modifier.PROTECTED, Modifier_1.Modifier.READONLY].includes(m))) {
                        // Add default public modifier
                        property = property.addModifiers(Modifier_1.Modifier.PUBLIC);
                    }
                    property.emit(codeWriter, [], false);
                    param.emitDefaultValue(codeWriter);
                    // Remove initializing statements
                    body = body.remove(this.constructorPropertyInitSearch(property.name));
                }
                else {
                    param.emit(codeWriter, true, isRest);
                }
            });
            codeWriter.emit(' {\n');
            codeWriter.indent();
            codeWriter.emitCodeBlock(body);
            codeWriter.unindent();
            codeWriter.emit('}\n');
        }
        // Constructors.
        this.functionSpecs.forEach(funSpec => {
            if (funSpec.isConstructor()) {
                codeWriter.emit('\n');
                funSpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC]);
            }
        });
        // Functions (static and non-static).
        this.functionSpecs.forEach(funSpec => {
            if (!funSpec.isConstructor()) {
                codeWriter.emit('\n');
                funSpec.emit(codeWriter, [Modifier_1.Modifier.PUBLIC]);
            }
        });
        codeWriter.unindent();
        if (!this.hasNoBody) {
            codeWriter.emit('\n');
        }
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
    addDecorators(...decoratorSpecs) {
        return this.copy({
            decorators: [...this.decorators, ...decoratorSpecs],
        });
    }
    addDecorator(decoratorSpec) {
        return this.copy({
            decorators: [...this.decorators, decoratorSpec],
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
    superClass(superClass) {
        // check(this.superClass == null) { "superclass already set to ${this.superClass}" }
        return this.copy({
            superClassField: TypeNames_1.TypeNames.anyTypeMaybeString(superClass),
        });
    }
    addInterfaces(interfaces) {
        return this.copy({
            interfaces: [...this.interfaces, ...interfaces],
        });
    }
    addInterface(iface) {
        return this.copy({
            interfaces: [...this.interfaces, TypeNames_1.TypeNames.anyTypeMaybeString(iface)],
        });
    }
    // "constructor" can't be a method name
    cstr(constructor) {
        if (constructor) {
            // require(constructor.isConstructor) { "expected a constructor but was ${constructor.name}; use FunctionSpec.createConstructor when building"
        }
        return this.copy({
            constructorField: constructor,
        });
    }
    addProperties(...propertySpecs) {
        return this.copy({
            propertySpecs: [...this.propertySpecs, ...propertySpecs],
        });
    }
    addProperty() {
        let propertySpec;
        if (arguments[0] instanceof PropertySpec_1.PropertySpec) {
            propertySpec = arguments[0];
        }
        else {
            const name = arguments[0];
            const type = TypeNames_1.TypeNames.anyTypeMaybeString(arguments[1]);
            const data = arguments[2] || {};
            propertySpec = PropertySpec_1.PropertySpec.create(name, type).copy(data);
        }
        return this.copy({
            propertySpecs: [...this.propertySpecs, propertySpec],
        });
    }
    addFunctions(...functionSpecs) {
        functionSpecs.forEach(it => this.addFunction(it));
        return this;
    }
    addFunction(functionSpec) {
        // require(!functionSpec.isConstructor) { "Use the 'constructor' method for the constructor" }
        return this.copy({
            functionSpecs: [...this.functionSpecs, functionSpec.setEnclosed(FunctionSpec_1.Encloser.CLASS)],
        });
    }
    toString() {
        return CodeWriter_1.CodeWriter.emitToString(this);
    }
    /** Returns the properties that can be declared inline as constructor parameters. */
    constructorProperties() {
        const cstr = this.constructorField;
        if (!cstr || !cstr.body) {
            return new Map();
        }
        const result = new Map();
        this.propertySpecs.forEach(property => {
            const parameter = cstr.parameter(property.name);
            if (!parameter ||
                parameter.type !== property.type ||
                parameter.optional !== property.optional ||
                property.initializerField !== undefined) {
                return;
            }
            const foundAssignment = cstr.body.formatParts.find(p => p.match(this.constructorPropertyInitSearch(property.name)) !== null);
            if (!foundAssignment) {
                return;
            }
            result.set(property.name, property);
        });
        return result;
    }
    constructorPropertyInitSearch(n) {
        // the outfoxx code was a lot fancier than this, but for now do the simple thing
        // and only match on standalone lines that are exactly `this.foo = foo` (we assume
        // any indentation and
        const pattern = `^this\\.${n}\\s*=\\s*${n}$`;
        return new RegExp(pattern);
    }
    get hasNoBody() {
        if (this.propertySpecs.length > 0) {
            const constructorProperties = this.constructorProperties();
            const nonCstrProperties = this.propertySpecs.filter(p => !constructorProperties.has(p.name));
            if (nonCstrProperties.length > 0) {
                return false;
            }
        }
        return this.constructorField === undefined && this.functionSpecs.length === 0;
    }
}
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "name", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "javaDoc", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "decorators", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "modifiers", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "typeVariables", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "superClassField", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "interfaces", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "propertySpecs", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "constructorField", void 0);
__decorate([
    ts_imm_1.imm
], ClassSpec.prototype, "functionSpecs", void 0);
exports.ClassSpec = ClassSpec;
