
export interface ImportedThing {
  created_at?: Date;
}

export namespace ImportedThing {
  export function fromObject(obj: any): ImportedThing {
    return {
      ...obj,
      created_at: obj.created_at != null ? Date.fromObject(obj.created_at) : undefined,
    }
  }
}
