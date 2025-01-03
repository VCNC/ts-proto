/* eslint-disable */


export type SampleEnum = 'LOREM' | 'IPSUM';

export function SampleEnum_fromString(str: string): SampleEnum | undefined {
  switch (str) {
    case "LOREM":
    case "IPSUM":
    return str
    default: return undefined
  }
}

export interface ParentMessage {
  /**
   * OneOf-oneof_test
   */
  childEnum?: ParentMessage.ChildEnum;
  /**
   * OneOf-oneof_test
   */
  sampleEnum?: SampleEnum;
  doubleTest?: number;
  floatTest: number;
  int32Test: number;
  int64Test: number;
  boolTest: boolean;
  stringTest: string;
  boolArrayTest: boolean[];
  messageArray: ParentMessage.ChildMessage[];
}

export namespace ParentMessage {
  export function fromObject(obj: any): ParentMessage {
    return {
      ...obj,
      childEnum: ParentMessage.ChildEnum_fromString(obj.childEnum),
      sampleEnum: SampleEnum_fromString(obj.sampleEnum),
      int64Test: parseInt(obj.int64Test),
      messageArray: obj.messageArray.map((v: any) => ParentMessage.ChildMessage.fromObject(v)),
    }
  }

  /**
   *  comment for child enum
   *
   * CHILD_LOREM : 
     *  comment for lorem
   * CHILD_IPSUM : 
     *  comment for ipsum
     *  comment2 for ipsum
   */
  export type ChildEnum = 'CHILD_LOREM' | 'CHILD_IPSUM';

  export function ChildEnum_fromString(str: string): ChildEnum | undefined {
    switch (str) {
      case "CHILD_LOREM":
      case "CHILD_IPSUM":
      return str
      default: return undefined
    }
  }

  export interface ChildMessage {
    recursive?: ParentMessage.ChildMessage;
  }

  export namespace ChildMessage {
    export function fromObject(obj: any): ChildMessage {
      return {
        ...obj,
        recursive: obj.recursive != null ? ParentMessage.ChildMessage.fromObject(obj.recursive) : undefined,
      }
    }
  }
}

export interface SampleMessage {
  stringMap: { [key: string]: string };
  enumMap: { [key: string]: SampleEnum };
  messageMap: { [key: string]: ParentMessage.ChildMessage };
  int64Map: { [key: string]: number };
}

export namespace SampleMessage {
  export function fromObject(obj: any): SampleMessage {
    return {
      ...obj,
      enumMap: (() => {
        const ret: any = {}
        Object.entries(obj).forEach(([k,v]) => {
          ret[k] = SampleEnum_fromString(v as string)
        })
        return ret
      })(),
      messageMap: (() => {
        const ret: any = {}
        Object.entries(obj).forEach(([k,v]) => {
          ret[k] = ParentMessage.ChildMessage.fromObject(v)
        })
        return ret
      })(),
      int64Map: (() => {
        const ret: any = {}
        Object.entries(obj).forEach(([k,v]) => {
          ret[k] = parseInt(v as string)
        })
        return ret
      })(),
    }
  }
}
