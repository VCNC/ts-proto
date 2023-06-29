

export interface Point {
  lat: number;
  lng: number;
}

export namespace Point {
  export function fromObject(obj: any): Point {
    return {
      ...obj,
    }
  }
}

export interface Area {
  nw?: Point;
  se?: Point;
}

export namespace Area {
  export function fromObject(obj: any): Area {
    return {
      ...obj,
      nw: obj.nw != null ? Point.fromObject(obj.nw) : undefined,
      se: obj.se != null ? Point.fromObject(obj.se) : undefined,
    }
  }
}
