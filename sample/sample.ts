/* eslint-disable */


export const enum SampleEnum {
  LOREM = "LOREM",
  IPSUM = "IPSUM",
}

export function SampleEnum_fromString(str: string): SampleEnum | undefined {
  switch (str) {
    case SampleEnum.LOREM:
    case SampleEnum.IPSUM:
    return str
    default: return undefined
  }
}

export interface ParentMessage {
  doubleTest: number;
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
      int64Test: parseInt(obj.int64Test),
      messageArray: obj.messageArray.map((v: any) => ParentMessage.ChildMessage.fromObject(v)),
    }
  }

  export const enum ChildEnum {
    CHILD_LOREM = "CHILD_LOREM",
    CHILD_IPSUM = "CHILD_IPSUM",
  }

  export function ChildEnum_fromString(str: string): ChildEnum | undefined {
    switch (str) {
      case ChildEnum.CHILD_LOREM:
      case ChildEnum.CHILD_IPSUM:
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
