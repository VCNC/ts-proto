"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fields = {
    file: {
        syntax: 12,
        message_type: 4,
        enum_type: 5,
        service: 6,
        extension: 7
    },
    message: {
        field: 2,
        nested_type: 3,
        enum_type: 4
    },
    enum: {
        value: 2
    },
    service: {
        method: 2
    }
};
class EmptyDescription {
    constructor() {
        this.span = [];
        this.leadingComments = '';
        this.trailingComments = '';
        this.leadingDetachedComments = [];
    }
}
class SourceInfo {
    constructor(sourceCode, selfDescription) {
        this.sourceCode = sourceCode;
        this.selfDescription = selfDescription;
    }
    static empty() {
        return new SourceInfo({}, new EmptyDescription());
    }
    static fromDescriptor(file) {
        let map = {};
        if (file.sourceCodeInfo && file.sourceCodeInfo.location) {
            file.sourceCodeInfo.location.forEach(loc => {
                map[loc.path.join('.')] = loc;
            });
        }
        return new SourceInfo(map, new EmptyDescription());
    }
    get span() {
        return this.selfDescription.span;
    }
    get leadingComments() {
        return this.selfDescription.leadingComments;
    }
    get trailingComments() {
        return this.selfDescription.trailingComments;
    }
    get leadingDetachedComments() {
        return this.selfDescription.leadingDetachedComments;
    }
    lookup(type, index) {
        if (index === undefined) {
            return this.sourceCode[`${type}`] || new EmptyDescription();
        }
        return this.sourceCode[`${type}.${index}`] || new EmptyDescription();
    }
    open(type, index) {
        const prefix = `${type}.${index}.`;
        const map = {};
        Object.keys(this.sourceCode)
            .filter(key => key.startsWith(prefix))
            .forEach(key => {
            map[key.substr(prefix.length)] = this.sourceCode[key];
        });
        return new SourceInfo(map, this.lookup(type, index));
    }
}
exports.default = SourceInfo;
