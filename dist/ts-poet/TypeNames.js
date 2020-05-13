"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SymbolSpecs_1 = require("./SymbolSpecs");
class TypeName {
    toString() {
        return this.reference(undefined);
    }
    union(other) {
        return TypeNames.unionType(this, other);
    }
    param(...typeArgs) {
        return TypeNames.parameterizedType(this, ...typeArgs);
    }
    useShortArraySyntax() {
        return true;
    }
}
exports.TypeName = TypeName;
class Any extends TypeName {
    constructor(usage, imported) {
        super();
        this.usage = usage;
        this.imported = imported;
    }
    reference(trackedBy) {
        if (this.imported) {
            this.imported.reference(trackedBy);
        }
        return this.usage;
    }
}
exports.Any = Any;
class Parameterized extends TypeName {
    constructor(name, typeArgs) {
        super();
        this.name = name;
        this.typeArgs = typeArgs;
    }
    reference(trackedBy) {
        const name = this.name.reference(trackedBy);
        const typeArgs = this.typeArgs.map(it => it.reference(trackedBy));
        if (name === 'Array' && this.typeArgs.every(t => t.useShortArraySyntax())) {
            return `${typeArgs.join(', ')}[]`;
        }
        else {
            return `${name}<${typeArgs.join(', ')}>`;
        }
    }
    useShortArraySyntax() {
        return false;
    }
}
exports.Parameterized = Parameterized;
var Combiner;
(function (Combiner) {
    Combiner["UNION"] = "|";
    Combiner["INTERSECT"] = "&";
})(Combiner = exports.Combiner || (exports.Combiner = {}));
var BoundModifier;
(function (BoundModifier) {
    BoundModifier["KEY_OF"] = "keyof";
})(BoundModifier = exports.BoundModifier || (exports.BoundModifier = {}));
class Bound {
    constructor(type, combiner = Combiner.UNION, modifier) {
        this.type = type;
        this.combiner = combiner;
        this.modifier = modifier;
    }
}
exports.Bound = Bound;
class TypeVariable extends TypeName {
    constructor(name, bounds) {
        super();
        this.name = name;
        this.bounds = bounds;
    }
    reference(trackedBy) {
        return this.name;
    }
    useShortArraySyntax() {
        return false;
    }
}
exports.TypeVariable = TypeVariable;
class Member {
    constructor(name, type, optional = false) {
        this.name = name;
        this.type = type;
        this.optional = optional;
    }
}
exports.Member = Member;
class Anonymous extends TypeName {
    constructor(members) {
        super();
        this.members = members;
    }
    reference(trackedBy) {
        const entries = this.members
            .map(it => {
            const name = it.name;
            const opt = it.optional ? '?' : '';
            const type = it.type.reference(trackedBy);
            return `${name}${opt}: ${type}`;
        })
            .join(', ');
        return `{ ${entries} }`;
    }
}
exports.Anonymous = Anonymous;
class Tuple extends TypeName {
    constructor(memberTypes) {
        super();
        this.memberTypes = memberTypes;
    }
    reference(trackedBy) {
        const typeRequirements = this.memberTypes.map(it => {
            it.reference(trackedBy);
        });
        return `[${typeRequirements.join(', ')}]`;
    }
    useShortArraySyntax() {
        return false;
    }
}
exports.Tuple = Tuple;
class Intersection extends TypeName {
    constructor(typeRequirements) {
        super();
        this.typeRequirements = typeRequirements;
    }
    reference(trackedBy) {
        return this.typeRequirements.map(it => it.reference(trackedBy)).join(' & ');
    }
    useShortArraySyntax() {
        return false;
    }
}
exports.Intersection = Intersection;
class Union extends TypeName {
    constructor(typeChoices) {
        super();
        this.typeChoices = typeChoices;
    }
    reference(trackedBy) {
        return this.typeChoices.map(it => it.reference(trackedBy)).join(' | ');
    }
    useShortArraySyntax() {
        return false;
    }
}
exports.Union = Union;
class Lambda extends TypeName {
    constructor(parameters = new Map(), returnType = TypeNames.VOID) {
        super();
        this.parameters = parameters;
        this.returnType = returnType;
    }
    reference(trackedBy) {
        const params = [];
        this.parameters.forEach((value, key) => {
            params.push(`${key}: ${value.reference(trackedBy)}`);
        });
        return `(${params.join(', ')}) => ${this.returnType.reference(trackedBy)}`;
    }
    useShortArraySyntax() {
        return false;
    }
}
exports.Lambda = Lambda;
class TypeNames {
    static importedType(spec) {
        const symbolSpec = SymbolSpecs_1.SymbolSpec.from(spec);
        return TypeNames.anyType(symbolSpec.value, symbolSpec);
    }
    static anyType(name, imported) {
        if (imported === undefined) {
            const match = name.match(SymbolSpecs_1.moduleSeparator);
            if (match && match.index !== undefined) {
                const idx = match.index;
                const usage = name.substring(0, idx);
                imported = SymbolSpecs_1.SymbolSpec.from(`${usage.split('.')[0]}${name.substring(idx)}`);
                return new Any(usage.length === 0 ? imported.value : usage, imported);
            }
        }
        return new Any(name, imported);
    }
    static typeLiteral(value) {
        if (typeof value === 'string') {
            return TypeNames.anyType(`'${value}'`);
        }
        else {
            return TypeNames.anyType(`${value}`);
        }
    }
    static anyTypeMaybeString(type) {
        return type instanceof TypeName ? type : TypeNames.anyType(type);
    }
    static typesOrStrings(types) {
        return types.map(t => this.anyTypeMaybeString(t));
    }
    static arrayType(elementType) {
        return TypeNames.parameterizedType(TypeNames.ARRAY, elementType);
    }
    static setType(elementType) {
        return TypeNames.parameterizedType(TypeNames.SET, elementType);
    }
    static mapType(keyType, valueType) {
        return TypeNames.parameterizedType(TypeNames.MAP, keyType, valueType);
    }
    static parameterizedType(rawType, ...typeArgs) {
        return new Parameterized(rawType, this.typesOrStrings(typeArgs));
    }
    static typeVariable(name, ...bounds) {
        return new TypeVariable(name, bounds);
    }
    static bound(type, combiner = Combiner.UNION, modifier) {
        return new Bound(TypeNames.anyTypeMaybeString(type), combiner, modifier);
    }
    static unionBound(type, keyOf = false) {
        return TypeNames.bound(type, Combiner.UNION, keyOf ? BoundModifier.KEY_OF : undefined);
    }
    static intersectBound(type, keyOf = false) {
        return TypeNames.bound(type, Combiner.INTERSECT, keyOf ? BoundModifier.KEY_OF : undefined);
    }
    static anonymousType(...members) {
        return new Anonymous(members.map(it => {
            return it instanceof Member ? it : new Member(it[0], it[1], false);
        }));
    }
    static tupleType(...memberTypes) {
        return new Tuple(memberTypes);
    }
    static intersectionType(...typeRequirements) {
        return new Intersection(typeRequirements);
    }
    static unionType(...typeChoices) {
        return new Union(this.typesOrStrings(typeChoices));
    }
    static lambda(parameters = new Map(), returnType) {
        return new Lambda(parameters, returnType);
    }
    static lambda2(parameters = [], returnType) {
        return new Lambda(new Map(parameters), returnType);
    }
}
exports.TypeNames = TypeNames;
TypeNames.NULL = TypeNames.anyType('null');
TypeNames.UNDEFINED = TypeNames.anyType('undefined');
TypeNames.NEVER = TypeNames.anyType('never');
TypeNames.VOID = TypeNames.anyType('void');
TypeNames.ANY = TypeNames.anyType('any');
TypeNames.BOOLEAN = TypeNames.anyType('boolean');
TypeNames.NUMBER = TypeNames.anyType('number');
TypeNames.STRING = TypeNames.anyType('string');
TypeNames.OBJECT = TypeNames.anyType('Object');
TypeNames.DATE = TypeNames.anyType('Date');
TypeNames.ARRAY = TypeNames.anyType('Array');
TypeNames.SET = TypeNames.anyType('Set');
TypeNames.MAP = TypeNames.anyType('Map');
TypeNames.PROMISE = TypeNames.anyType('Promise');
TypeNames.BUFFER = TypeNames.anyType('Buffer');
TypeNames.ARRAY_BUFFER = TypeNames.anyType('ArrayBuffer');
