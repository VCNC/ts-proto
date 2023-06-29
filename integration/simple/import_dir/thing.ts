
export interface ImportedThing {
  createdAt?: Date;
}

export namespace ImportedThing {
  export function fromObject(obj: any): ImportedThing {
    return {
      ...obj,
      createdAt: obj.createdAt != null ? Date.fromObject(obj.createdAt) : undefined,
    }
  }
}
