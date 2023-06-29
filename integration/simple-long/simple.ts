//  Adding a comment to the syntax will become the first
//  comment in the output source file.
//
import { ImportedThing } from './import_dir/thing';
import { StringValue, Int32Value, BoolValue } from './google/protobuf/wrappers';


export type StateEnum = 'UNKNOWN' | 'ON' | 'OFF';

export function StateEnum_fromString(str: string): StateEnum | undefined {
  switch (str) {
    case "UNKNOWN":
    case "ON":
    case "OFF":
    return str
    default: return undefined
  }
}

/**
 * * Example comment on the Simple message  */
export interface Simple {
  /**
   *  Name field
   */
  name: string;
  /**
   *  Age  */
  age: number;
  /**
   *  This comment will also attach
   */
  createdAt?: Date;
  child?: Child;
  state?: StateEnum;
  grandChildren: Child[];
  coins: number[];
  snacks: string[];
  oldStates: StateEnum[];
  /**
   *  A thing (imported from thing)
   */
  thing?: ImportedThing;
}

export namespace Simple {
  export function fromObject(obj: any): Simple {
    return {
      ...obj,
      createdAt: obj.createdAt != null ? Date.fromObject(obj.createdAt) : undefined,
      child: obj.child != null ? Child.fromObject(obj.child) : undefined,
      state: StateEnum_fromString(obj.state),
      grandChildren: obj.grandChildren.map((v: any) => Child.fromObject(v)),
      oldStates: obj.oldStates.map((v: any) => StateEnum_fromString(v)),
      thing: obj.thing != null ? ImportedThing.fromObject(obj.thing) : undefined,
    }
  }
}

export interface Child {
  name: string;
  type?: Child.Type;
}

export namespace Child {
  export function fromObject(obj: any): Child {
    return {
      ...obj,
      type: Child.Type_fromString(obj.type),
    }
  }

  export type Type = 'UNKNOWN' | 'GOOD' | 'BAD';

  export function Type_fromString(str: string): Type | undefined {
    switch (str) {
      case "UNKNOWN":
      case "GOOD":
      case "BAD":
      return str
      default: return undefined
    }
  }
}

export interface Nested {
  name: string;
  message?: Nested.InnerMessage;
  state?: Nested.InnerEnum;
}

export namespace Nested {
  export function fromObject(obj: any): Nested {
    return {
      ...obj,
      message: obj.message != null ? Nested.InnerMessage.fromObject(obj.message) : undefined,
      state: Nested.InnerEnum_fromString(obj.state),
    }
  }

  export type InnerEnum = 'UNKNOWN_INNER' | 'GOOD' | 'BAD';

  export function InnerEnum_fromString(str: string): InnerEnum | undefined {
    switch (str) {
      case "UNKNOWN_INNER":
      case "GOOD":
      case "BAD":
      return str
      default: return undefined
    }
  }

  /**
   *  Comment for a nested message * /
   */
  export interface InnerMessage {
    name: string;
    deep?: Nested.InnerMessage.DeepMessage;
  }

  export namespace InnerMessage {
    export function fromObject(obj: any): InnerMessage {
      return {
        ...obj,
        deep: obj.deep != null ? Nested.InnerMessage.DeepMessage.fromObject(obj.deep) : undefined,
      }
    }

    export interface DeepMessage {
      name: string;
    }

    export namespace DeepMessage {
      export function fromObject(obj: any): DeepMessage {
        return {
          ...obj,
        }
      }
    }
  }
}

export interface OneOfMessage {
  /**
   * OneOf-name_fields
   */
  first?: string;
  /**
   * OneOf-name_fields
   */
  last?: string;
}

export namespace OneOfMessage {
  export function fromObject(obj: any): OneOfMessage {
    return {
      ...obj,
    }
  }
}

export interface SimpleWithWrappers {
  name?: StringValue;
  age?: Int32Value;
  enabled?: BoolValue;
  coins: Int32Value[];
  snacks: StringValue[];
}

export namespace SimpleWithWrappers {
  export function fromObject(obj: any): SimpleWithWrappers {
    return {
      ...obj,
      name: obj.name != null ? StringValue.fromObject(obj.name) : undefined,
      age: obj.age != null ? Int32Value.fromObject(obj.age) : undefined,
      enabled: obj.enabled != null ? BoolValue.fromObject(obj.enabled) : undefined,
      coins: obj.coins.map((v: any) => Int32Value.fromObject(v)),
      snacks: obj.snacks.map((v: any) => StringValue.fromObject(v)),
    }
  }
}

export interface Entity {
  id: number;
}

export namespace Entity {
  export function fromObject(obj: any): Entity {
    return {
      ...obj,
    }
  }
}

export interface SimpleWithMap {
  entitiesById: { [key: number]: Entity };
  nameLookup: { [key: string]: string };
  intLookup: { [key: number]: number };
}

export namespace SimpleWithMap {
  export function fromObject(obj: any): SimpleWithMap {
    return {
      ...obj,
      entitiesById: (() => {
        const ret: any = {}
        Object.entries(obj).forEach(([k,v]) => {
          ret[k] = Entity.fromObject(v)
        })
        return ret
      })(),
    }
  }
}

export interface SimpleWithSnakeCaseMap {
  entitiesById: { [key: number]: Entity };
}

export namespace SimpleWithSnakeCaseMap {
  export function fromObject(obj: any): SimpleWithSnakeCaseMap {
    return {
      ...obj,
      entitiesById: (() => {
        const ret: any = {}
        Object.entries(obj).forEach(([k,v]) => {
          ret[k] = Entity.fromObject(v)
        })
        return ret
      })(),
    }
  }
}

export interface PingRequest {
  input: string;
}

export namespace PingRequest {
  export function fromObject(obj: any): PingRequest {
    return {
      ...obj,
    }
  }
}

export interface PingResponse {
  output: string;
}

export namespace PingResponse {
  export function fromObject(obj: any): PingResponse {
    return {
      ...obj,
    }
  }
}

export interface Numbers {
  double: number;
  float: number;
  int32: number;
  int64: number;
  uint32: number;
  uint64: number;
  sint32: number;
  sint64: number;
  fixed32: number;
  fixed64: number;
  sfixed32: number;
  sfixed64: number;
}

export namespace Numbers {
  export function fromObject(obj: any): Numbers {
    return {
      ...obj,
      int64: parseInt(obj.int64),
      uint64: parseInt(obj.uint64),
      fixed64: parseInt(obj.fixed64),
    }
  }
}
