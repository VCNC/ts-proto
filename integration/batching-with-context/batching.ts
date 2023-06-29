

export interface BatchQueryRequest {
  ids: string[];
}

export namespace BatchQueryRequest {
  export function fromObject(obj: any): BatchQueryRequest {
    return {
      ...obj,
    }
  }
}

export interface BatchQueryResponse {
  entities: Entity[];
}

export namespace BatchQueryResponse {
  export function fromObject(obj: any): BatchQueryResponse {
    return {
      ...obj,
      entities: obj.entities.map((v: any) => Entity.fromObject(v)),
    }
  }
}

export interface BatchMapQueryRequest {
  ids: string[];
}

export namespace BatchMapQueryRequest {
  export function fromObject(obj: any): BatchMapQueryRequest {
    return {
      ...obj,
    }
  }
}

export interface BatchMapQueryResponse {
  entities: { [key: string]: Entity };
}

export namespace BatchMapQueryResponse {
  export function fromObject(obj: any): BatchMapQueryResponse {
    return {
      ...obj,
      entities: (() => {
        const ret: any = {}
        Object.entries(obj).forEach(([k,v]) => {
          ret[k] = Entity.fromObject(v)
        })
        return ret
      })(),
    }
  }
}

export interface GetOnlyMethodRequest {
  id: string;
}

export namespace GetOnlyMethodRequest {
  export function fromObject(obj: any): GetOnlyMethodRequest {
    return {
      ...obj,
    }
  }
}

export interface GetOnlyMethodResponse {
  entity?: Entity;
}

export namespace GetOnlyMethodResponse {
  export function fromObject(obj: any): GetOnlyMethodResponse {
    return {
      ...obj,
      entity: obj.entity != null ? Entity.fromObject(obj.entity) : undefined,
    }
  }
}

export interface WriteMethodRequest {
  id: string;
}

export namespace WriteMethodRequest {
  export function fromObject(obj: any): WriteMethodRequest {
    return {
      ...obj,
    }
  }
}

export interface WriteMethodResponse {
}

export namespace WriteMethodResponse {
  export function fromObject(obj: any): WriteMethodResponse {
    return {
      ...obj,
    }
  }
}

export interface Entity {
  id: string;
  name: string;
}

export namespace Entity {
  export function fromObject(obj: any): Entity {
    return {
      ...obj,
    }
  }
}
