import { MapObjectOptions, ObjectMap, Context, TraversalCallback } from './mapObject.types'

/**
 *
 * A object mapper will traverse an object recursivally and will generate a record for every property
 * in it describing it, or if a property is an object will map it as a object map as well.
 *
 * If the object mapper finds a loop in the hierarchy it will refenrece the previously processed
 * object map for the object that creates the loop.
 *
 */

/** Recursively maps an object and returns on object map of it */
export function mapObject(subject: any, options: MapObjectOptions = { ingonoreInaccessible: true, keyInspector: 'simple' }, callback?: TraversalCallback): ObjectMap {
  const finalOptions: MapObjectOptions = { ingonoreInaccessible: true, keyInspector: 'simple', ...options }
  const context: Context = { visited: { values: [], analogs: [] }, nextId: 0 }

  return recursiveMap(subject, 0, context, finalOptions, callback)
}

/** Internal recursive function to map an object */
function recursiveMap(subject: any, level: number, context: Context, options: MapObjectOptions, callback?: TraversalCallback): ObjectMap {
  const indexofVisited = context.visited.values.indexOf(subject)

  // If the subject was already visited we return the same object map previously processed
  if (indexofVisited !== -1) {
    return context.visited.analogs[indexofVisited]
  } else {
    const subjectType = typeof subject
    const objectMap: ObjectMap = { id: context.nextId++, level, properties: {}, type: subjectType }
    const subjectKeys = getAllPropertyNames(subject, options)

    // We push them already so they can be found in subsecuent recursivity
    context.visited.values.push(subject)
    context.visited.analogs.push(objectMap)

    for (let i = 0; i < subjectKeys.length; i++) {
      const currentKey = subjectKeys[i]

      try {
        if (callback) {
          const potentialValue = callback(subject[currentKey])

          if (potentialValue) {
            subject[currentKey] = potentialValue
          }
        }

        const value = subject[currentKey]
        const type = typeof subject[currentKey]

        switch (type) {
          case 'object':
          case 'function':
            if (options.maxDepth && options.maxDepth <= level) {
              if (!options.ignoreLevelsBeyondMaxDepth) {
                objectMap.properties[currentKey] = { error: 'MAX DEPTH REACHED', level: level + 1, propertyKey: currentKey }
              }
            } else {
              objectMap.properties[currentKey] = recursiveMap(subject[currentKey], level + 1, context, options, callback)
            }
            break
          default:
            const descriptor = Object.getOwnPropertyDescriptor(subject[currentKey], currentKey)

            objectMap.properties[currentKey] = { descriptor, level, propertyKey: currentKey, type, value }
        }
      } catch {
        if (!options.ingonoreInaccessible) {
          objectMap.properties[currentKey] = { error: 'INACCESSIBLE', level, propertyKey: currentKey }
        }
      }
    }

    return objectMap
  }
}

/** Gets all properties realted to an object and filter them if configured */
function getAllPropertyNames(subject: any, options: MapObjectOptions): string[] {
  let propertyKeys = []

  if (subject) {
    switch (options.keyInspector) {
      case 'prototypeChain':
        do {
          Object.getOwnPropertyNames(subject).forEach((prop: string): void => {
            if (propertyKeys.indexOf(prop) === -1) {
              propertyKeys.push(prop)
            }
          })
        } while ((subject = Object.getPrototypeOf(subject)))
        break
      case 'simple':
      default:
        propertyKeys = Object.getOwnPropertyNames(subject)
        break
    }
  }

  // Filter properties first by including patterns and if not
  // By inlcuding patterns
  if (options.propertyFilter) {
    if (options.propertyFilter.exclude) {
      return propertyKeys.filter((propertyKey: string): boolean => {
        if (Array.isArray(options.propertyFilter.exclude)) {
          return !options.propertyFilter.exclude.includes(propertyKey)
        } else {
          return !options.propertyFilter.exclude.exec(propertyKey)
        }
      })
    }
    if (options.propertyFilter.include) {
      return propertyKeys.filter((propertyKey: string): boolean => {
        if (Array.isArray(options.propertyFilter.include)) {
          return options.propertyFilter.include.includes(propertyKey)
        } else {
          return !!options.propertyFilter.include.exec(propertyKey)
        }
      })
    }
  }

  return propertyKeys
}
