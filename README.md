# Object Mapper

[![npm version](https://badge.fury.io/js/@universal-packages%2Fobject-mapper.svg)](https://www.npmjs.com/package/@universal-packages/object-mapper)
[![Testing](https://github.com/universal-packages/universal-object-mapper/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-object-mapper/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-object-mapper/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-object-mapper)

For those not so common situations where you just want to know the composition of a complex object to analyze and probably recompose such object.

## Install

```shell
npm install @universal-packages/object-mapper
```

## mapObject()

Will traverse an object recursivally and will generate a record for every property in it describing it, or if a property is an object will map it as a object map as well. If the object mapper finds a loop in the hierarchy it will refenrece the previously processed object map for the object that creates the loop.

```js
import { mapObject } from '@universal-packages/object-mapper'

const result = mapObject({ hola: 'hello' })

// > {
// >   id: 0,
// >   level: 0,
// >   properties: { hola: { descriptor: undefined, propertyKey: 'hola', level: 0, type: 'string', value: 'hello' } },
// >   type: 'object'
// > }
```

## Options

- **`ingonoreInaccessible`** `boolean`
  Some properties in the prototype chain can't be accessed in any way, you can get an error of this event or just ignore those properties

- **`ignoreLevelsBeyondMaxDepth`** `boolean`
  If a property is in a level beyond the max you can ignore it or get an error of the event.

- **`keyInspector`** `'simple' | 'prototypeChain'`
  A simple key inspector will `getOwnPropertyNames` to get propertiess from the object, or you can opt to get all properties going all up the prototype chain, usefull to get properties inherited in classes.
- **`maxDepth`** `number`
  Max level the recursive traversal can reach
- **`propertyFilter`** `{ include?: RegExp | string[]; exclude?: RegExp | string[] }`
  Include this if you want to only process certain properties from the object

  for example to include only a group of properties:

  ```js
  import { mapObject } from '@universal-packages/object-mapper'

  const options = {
    propertyFilter: { include: ['property1', 'property3'] }
  }

  const result = mapObject({ property1: '1', property2: '2', property3: '3' }, options)

  console.log(result)

  // > { properties: { property1: { ... }, property3: { ... } } }
  ```

  for the contrary you can exclude them from the result

  ```typescript
  import { mapObject } from '@universal-packages/object-mapper'

  const options = {
    propertyFilter: { exclude: ['property1', 'property3'] }
  }

  const result = mapObject({ property1: '1', property2: '2', property3: '3' }, options)

  console.log(result)

  // > { properties: { property2: { ... } } }
  ```

## Callback

Use a callback for every value visited to use it or modify it in any way in the original object.

```js
import { mapObject } from '@universal-packages/object-mapper'

const result = mapObject({ hola: 'hello' }, null, (value: any): any => {
  return 'other value post processing it'
})

console.log(result)

//> {
//>   id: 0,
//>   level: 0,
//>   properties: { hola: { descriptor: undefined, propertyKey: 'hola', level: 0, type: 'string', value: 'other value post processing it' } },
//>   type: 'object'
//> }
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
