
/**
 *  Wrapper message for `double`.
 *
 *  The JSON representation for `DoubleValue` is JSON number.
 */
export interface DoubleValue {
  /**
   *  The double value.
   */
  value: number;
}

export namespace DoubleValue {
  export function fromObject(obj: any): DoubleValue {
    return {
      ...obj,
    }
  }
}

/**
 *  Wrapper message for `float`.
 *
 *  The JSON representation for `FloatValue` is JSON number.
 */
export interface FloatValue {
  /**
   *  The float value.
   */
  value: number;
}

export namespace FloatValue {
  export function fromObject(obj: any): FloatValue {
    return {
      ...obj,
    }
  }
}

/**
 *  Wrapper message for `int64`.
 *
 *  The JSON representation for `Int64Value` is JSON string.
 */
export interface Int64Value {
  /**
   *  The int64 value.
   */
  value: number;
}

export namespace Int64Value {
  export function fromObject(obj: any): Int64Value {
    return {
      ...obj,
      value: parseInt(obj.value),
    }
  }
}

/**
 *  Wrapper message for `uint64`.
 *
 *  The JSON representation for `UInt64Value` is JSON string.
 */
export interface UInt64Value {
  /**
   *  The uint64 value.
   */
  value: number;
}

export namespace UInt64Value {
  export function fromObject(obj: any): UInt64Value {
    return {
      ...obj,
      value: parseInt(obj.value),
    }
  }
}

/**
 *  Wrapper message for `int32`.
 *
 *  The JSON representation for `Int32Value` is JSON number.
 */
export interface Int32Value {
  /**
   *  The int32 value.
   */
  value: number;
}

export namespace Int32Value {
  export function fromObject(obj: any): Int32Value {
    return {
      ...obj,
    }
  }
}

/**
 *  Wrapper message for `uint32`.
 *
 *  The JSON representation for `UInt32Value` is JSON number.
 */
export interface UInt32Value {
  /**
   *  The uint32 value.
   */
  value: number;
}

export namespace UInt32Value {
  export function fromObject(obj: any): UInt32Value {
    return {
      ...obj,
    }
  }
}

/**
 *  Wrapper message for `bool`.
 *
 *  The JSON representation for `BoolValue` is JSON `true` and `false`.
 */
export interface BoolValue {
  /**
   *  The bool value.
   */
  value: boolean;
}

export namespace BoolValue {
  export function fromObject(obj: any): BoolValue {
    return {
      ...obj,
    }
  }
}

/**
 *  Wrapper message for `string`.
 *
 *  The JSON representation for `StringValue` is JSON string.
 */
export interface StringValue {
  /**
   *  The string value.
   */
  value: string;
}

export namespace StringValue {
  export function fromObject(obj: any): StringValue {
    return {
      ...obj,
    }
  }
}

/**
 *  Wrapper message for `bytes`.
 *
 *  The JSON representation for `BytesValue` is JSON string.
 */
export interface BytesValue {
  /**
   *  The bytes value.
   */
  value: Uint8Array;
}

export namespace BytesValue {
  export function fromObject(obj: any): BytesValue {
    return {
      ...obj,
    }
  }
}
