

export interface Tile {
  layers: Tile.Layer[];
}

export namespace Tile {
  export function fromObject(obj: any): Tile {
    return {
      ...obj,
      layers: obj.layers.map((v: any) => Tile.Layer.fromObject(v)),
    }
  }

  export type GeomType = 'UNKNOWN' | 'POINT' | 'LINESTRING' | 'POLYGON';

  export function GeomType_fromString(str: string): GeomType | undefined {
    switch (str) {
      case "UNKNOWN":
      case "POINT":
      case "LINESTRING":
      case "POLYGON":
      return str
      default: return undefined
    }
  }

  export interface Value {
    stringValue: string;
    floatValue: number;
    doubleValue: number;
    intValue: number;
    uintValue: number;
    sintValue: number;
    boolValue: boolean;
  }

  export namespace Value {
    export function fromObject(obj: any): Value {
      return {
        ...obj,
        intValue: parseInt(obj.intValue),
        uintValue: parseInt(obj.uintValue),
      }
    }
  }

  export interface Feature {
    id: number;
    tags: number[];
    type?: Tile.GeomType;
    geometry: number[];
  }

  export namespace Feature {
    export function fromObject(obj: any): Feature {
      return {
        ...obj,
        id: parseInt(obj.id),
        type: Tile.GeomType_fromString(obj.type),
      }
    }
  }

  export interface Layer {
    version: number;
    name: string;
    features: Tile.Feature[];
    keys: string[];
    values: Tile.Value[];
    extent: number;
  }

  export namespace Layer {
    export function fromObject(obj: any): Layer {
      return {
        ...obj,
        features: obj.features.map((v: any) => Tile.Feature.fromObject(v)),
        values: obj.values.map((v: any) => Tile.Value.fromObject(v)),
      }
    }
  }
}
