export type TraversalCallback = (vaue: any) => any
export type KeyInspector = 'simple' | 'prototypeChain'

/** Contains object mapper configurations */
export interface MapObjectOptions {
  ingonoreInaccessible?: boolean
  ignoreLevelsBeyondMaxDepth?: boolean
  keyInspector?: KeyInspector
  maxDepth?: number
  propertyFilter?: { include?: RegExp | string[]; exclude?: RegExp | string[] }
}

/** Contains information about a property in an object. */
export interface PropertyRecord {
  descriptor?: PropertyDescriptor
  error?: string
  level: number
  propertyKey: string
  type?: string
  value?: any
}

/** Contains information about an object */
export interface ObjectMap {
  id: number
  level: number
  properties: { [key: string]: PropertyRecord | ObjectMap }
  type: string
  freeSlot?: any
}

/** Internal recursion axuliar object */
export interface Context {
  visited: {
    values: any[]
    analogs: any[]
  }
  nextId: number
}
