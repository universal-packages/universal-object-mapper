import { EventEmitter } from 'events'

import { mapObject } from '../src'

describe(mapObject, (): void => {
  it('can map a simple object', async (): Promise<void> => {
    const result = mapObject({ hola: 'hello' })

    expect(result).toEqual({
      id: 0,
      level: 0,
      properties: { hola: { descriptor: undefined, propertyKey: 'hola', level: 0, type: 'string', value: 'hello' } },
      type: 'object'
    })
  })

  it('can callback for every entry', async (): Promise<void> => {
    const myObject = { hola: 'hello' }

    const result = mapObject(myObject, null, (_value: any, _key: string): any => {
      return 'other value post processing it'
    })

    expect(result).toEqual({
      id: 0,
      level: 0,
      properties: { hola: { descriptor: undefined, propertyKey: 'hola', level: 0, type: 'string', value: 'other value post processing it' } },
      type: 'object'
    })

    expect(myObject).toEqual({ hola: 'other value post processing it' })
  })

  it('can map an object recursively', async (): Promise<void> => {
    const result = mapObject({ en: { hola: 'hello', adios: { one: 'bye', two: 'to god' } } })

    expect(result).toEqual({
      id: 0,
      level: 0,
      properties: {
        en: {
          id: 1,
          level: 1,
          properties: {
            hola: {
              descriptor: undefined,
              propertyKey: 'hola',
              level: 1,
              type: 'string',
              value: 'hello'
            },
            adios: {
              id: 2,
              level: 2,
              properties: {
                one: { descriptor: undefined, propertyKey: 'one', level: 2, type: 'string', value: 'bye' },
                two: { descriptor: undefined, propertyKey: 'two', level: 2, type: 'string', value: 'to god' }
              },
              type: 'object'
            }
          },
          type: 'object'
        }
      },
      type: 'object'
    })
  })

  it('can map an object and avoid infinite lopps referencing also the object map object', async (): Promise<void> => {
    const object1: any = {}
    const object2: any = {}

    object1.loop = object2
    object2.loop = object1

    const result = mapObject({ object1, object2 })

    expect(result).toMatchObject({
      id: 0,
      level: 0,
      properties: {
        object1: {
          id: 1,
          level: 1,
          properties: {
            loop: {
              id: 2,
              level: 2,
              properties: {
                loop: {
                  id: 1,
                  level: 1,
                  type: 'object'
                }
              },
              type: 'object'
            }
          },
          type: 'object'
        },
        object2: {
          // <------ this is a reference to an already processsed object map
          id: 2,
          level: 2,
          type: 'object'
        }
      },
      type: 'object'
    })
  })

  it('can map an object by its prototype chain', async (): Promise<void> => {
    const result = mapObject(EventEmitter, { keyInspector: 'prototypeChain', ignoreInaccessible: false })

    expect(result).toMatchObject({
      properties: {
        length: {
          type: 'number'
        },
        name: {
          type: 'string'
        },
        prototype: {
          properties: {
            constructor: {},
            _eventsCount: {
              type: 'number'
            },
            setMaxListeners: {
              type: 'function'
            },
            getMaxListeners: {
              type: 'function'
            },
            emit: {
              type: 'function'
            },
            addListener: {
              type: 'function'
            },
            on: {
              type: 'function'
            }
          }
        }
      }
    })
  })

  describe('filtering', (): void => {
    it('can include only properties in list', async (): Promise<void> => {
      const result = mapObject({ one: 'one', two: 'two' }, { propertyFilter: { include: ['one'] } })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          one: { descriptor: undefined, propertyKey: 'one', level: 0, type: 'string', value: 'one' }
        },
        type: 'object'
      })
    })

    it('can include only properties matched', async (): Promise<void> => {
      const result = mapObject({ one: 'one', two: 'two' }, { propertyFilter: { include: /one/ } })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          one: { descriptor: undefined, propertyKey: 'one', level: 0, type: 'string', value: 'one' }
        },
        type: 'object'
      })
    })

    it('can exclude properties in list', async (): Promise<void> => {
      const result = mapObject({ one: 'one', two: 'two' }, { propertyFilter: { exclude: ['two'] } })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          one: { descriptor: undefined, propertyKey: 'one', level: 0, type: 'string', value: 'one' }
        },
        type: 'object'
      })
    })

    it('can exclude properties matched', async (): Promise<void> => {
      const result = mapObject({ one: 'one', two: 'two' }, { propertyFilter: { exclude: /two/ } })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          one: { descriptor: undefined, propertyKey: 'one', level: 0, type: 'string', value: 'one' }
        },
        type: 'object'
      })
    })

    it('excludes then includes', async (): Promise<void> => {
      const result = mapObject({ one: 'one', two: 'two' }, { propertyFilter: { include: ['two'], exclude: ['two'] } })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          one: { descriptor: undefined, propertyKey: 'one', type: 'string', level: 0, value: 'one' }
        },
        type: 'object'
      })
    })
  })

  describe('Limiting the max depth of the traversal', (): void => {
    it('stops at that level and shows an error', async (): Promise<void> => {
      const result = mapObject({ one: { two: { three: 'four' } } }, { maxDepth: 1 })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          one: {
            id: 1,
            level: 1,
            properties: {
              two: {
                error: 'MAX DEPTH REACHED',
                level: 2,
                propertyKey: 'two'
              }
            },
            type: 'object'
          }
        },
        type: 'object'
      })
    })

    it('can stop at that level and ignore the errors as if nothing is there', async (): Promise<void> => {
      const result = mapObject({ onde: { two: { three: 'four' } } }, { maxDepth: 1, ignoreLevelsBeyondMaxDepth: true })

      expect(result).toEqual({
        id: 0,
        level: 0,
        properties: {
          onde: {
            id: 1,
            level: 1,
            properties: {},
            type: 'object'
          }
        },
        type: 'object'
      })
    })
  })
})
