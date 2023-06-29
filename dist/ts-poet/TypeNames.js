"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SymbolSpecs_1 = require("./SymbolSpecs");
/**
 * Name of any possible type that can be referenced.
 */
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
/** Provides public factory methods for all of the type name variants. */
class TypeNames {
    /**
     * An imported type name
     *
     * @param spec Import spec for type name
     */
    static importedType(spec) {
        const symbolSpec = SymbolSpecs_1.SymbolSpec.from(spec);
        return TypeNames.anyType(symbolSpec.value, symbolSpec);
    }
    /**
     * Any class/enum/primitive/etc type name
     *
     * @param name Name for the type, will be symbolized
     */
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
    /**
     * A literal type value, e.g. 'one' or 1.
     */
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
    /**
     * Type name for the generic Array type
     *
     * @param elementType Element type of the array
     * @return Type name of the new array type
     */
    static arrayType(elementType) {
        return TypeNames.parameterizedType(TypeNames.ARRAY, elementType);
    }
    /**
     * Type name for the generic Set type
     *
     * @param elementType Element type of the set
     * @return Type name of the new set type
     */
    static setType(elementType) {
        return TypeNames.parameterizedType(TypeNames.SET, elementType);
    }
    /**
     * Type name for the generic Map type
     *
     * @param keyType Key type of the map
     * @param valueType Value type of the map
     * @return Type name of the new map type
     */
    static mapType(keyType, valueType) {
        return TypeNames.parameterizedType(TypeNames.MAP, keyType, valueType);
    }
    /**
     * Parameterized type that represents a concrete
     * usage of a generic type
     *
     * @param rawType Generic type to invoke with arguments
     * @param typeArgs Names of the provided type arguments
     * @return Type name of the new parameterized type
     */
    static parameterizedType(rawType, ...typeArgs) {
        return new Parameterized(rawType, this.typesOrStrings(typeArgs));
    }
    /**
     * Type variable represents a single variable type in a
     * generic type or function.
     *
     * @param name The name of the variable as it will be used in the definition
     * @param bounds Bound constraints that will be required during instantiation
     * @return Type name of the new type variable
     */
    static typeVariable(name, ...bounds) {
        return new TypeVariable(name, bounds);
    }
    /**
     * Factory for type variable bounds
     */
    static bound(type, combiner = Combiner.UNION, modifier) {
        return new Bound(TypeNames.anyTypeMaybeString(type), combiner, modifier);
    }
    /**
     * Factory for type variable bounds
     */
    static unionBound(type, keyOf = false) {
        return TypeNames.bound(type, Combiner.UNION, keyOf ? BoundModifier.KEY_OF : undefined);
    }
    /**
     * Factory for type variable bounds
     */
    static intersectBound(type, keyOf = false) {
        return TypeNames.bound(type, Combiner.INTERSECT, keyOf ? BoundModifier.KEY_OF : undefined);
    }
    /**
     * Anonymous type name (e.g. `{ length: number, name: string }`)
     *
     * @param members Member pairs to define the anonymous type
     * @return Type name representing the anonymous type
     */
    static anonymousType(...members) {
        return new Anonymous(members.map(it => {
            return it instanceof Member ? it : new Member(it[0], it[1], false);
        }));
    }
    /**
     * Tuple type name (e.g. `[number, boolean, string]`}
     *
     * @param memberTypes Each argument represents a distinct member type
     * @return Type name representing the tuple type
     */
    static tupleType(...memberTypes) {
        return new Tuple(memberTypes);
    }
    /**
     * Intersection type name (e.g. `Person & Serializable & Loggable`)
     *
     * @param typeRequirements Requirements of the intersection as individual type names
     * @return Type name representing the intersection type
     */
    static intersectionType(...typeRequirements) {
        return new Intersection(typeRequirements);
    }
    /**
     * Union type name (e.g. `int | number | any`)
     *
     * @param typeChoices All possible choices allowed in the union
     * @return Type name representing the union type
     */
    static unionType(...typeChoices) {
        return new Union(this.typesOrStrings(typeChoices));
    }
    /** Returns a lambda type with `returnType` and parameters of listed in `parameters`. */
    static lambda(parameters = new Map(), returnType) {
        return new Lambda(parameters, returnType);
    }
    /** Returns a lambda type with `returnType` and parameters of listed in `parameters`. */
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
