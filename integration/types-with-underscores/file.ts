

export interface Baz {
  /**
   * OneOf-type
   */
  foo?: FooBar;
}

export namespace Baz {
  export function fromObject(obj: any): Baz {
    return {
      ...obj,
      foo: obj.foo != null ? FooBar.fromObject(obj.foo) : undefined,
    }
  }
}

export interface FooBar {
}

export namespace FooBar {
  export function fromObject(obj: any): FooBar {
    return {
      ...obj,
    }
  }
}
