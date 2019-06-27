# ProtoSchema Guide

This project depends on some standards to work properly, these standards were thought to be easy to adopt and to make the task of dealing with JSON Schemas and Protobuf definitions more intuitive and clear. The list bellow describes the implemented standards:

* The project supports JSON Schema 7 and Protobuf 3.
* Every nested item is assumed to be referenced (with `$ref` property) and not declared as plain nested JSON Schema.
* Arrays can have only one type.
* The `$namespace` property is a custom attribute read by this library to specify the proto definition namespace.
* `number` and `integer` types can have the length specified by the `byteLength` custom property, the default value is **32**.
* The `null` type is encoded as an additional boolean property in proto definition prefixed by a string to indicate that the target property is declared as null, you can use the [@exocet/value-flagger](https://github.com/exocet-engineering/exocet-value-flagger) to deal with this behavior. This is required as Protobuf 3 doesn't have support to `null` values.
* The ID of every proto definition property is generated sequentially respecting the JSON Schema property specification sequence.

-----------------------

## Encoding JSON Schemas to Protobuf definitions

Let's say that we have the following JSON Schemas:


```typescript
import { IJSONSchemaProto } from 'protoschema';

const organizationSchema: IJSONSchemaProto  = {
  $id: 'Organization',
  $namespace: 'identity',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    description: {
      type: ['string', 'null']
    },
    active: {
      type: 'boolean'
    },
    valuation: {
      type: 'number',
      byteLength: 32
    },
    peopleCount: {
      type: 'integer',
      byteLength: 32
    },
    createdAtTimestamp: {
      type: 'integer',
      byteLength: 64
    },
    headOfficeLocation: {
      $ref: 'Location',
      $namespace: 'mapping'
    },
    subsidiariesLocations: {
      type: 'array',
      items: {
        $ref: 'Location',
        $namespace: 'mapping'
      }
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    invalidType: {
      type: 'invalidType'
    }
  }
};

const locationSchema: IJSONSchemaProto = {
  $id: 'Location',
  $namespace: 'mapping',
  type: 'object',
  properties: {
    type: {
      type: 'string'
    },
    latitude: {
      type: 'number',
      byteLength: 64
    },
    longitude: {
      type: 'number',
      byteLength: 64
    }
  }
};

const notificationSchema: IJSONSchemaProto = {
  $id: 'Notification',
  type: 'object',
  properties: {
    content: {
      type: 'string'
    }
  }
};
```

And we will now instantiate the ProtoSchema class and add our schemas:

```typescript
import { ProtoSchema } from 'protoschema';

const protoschema: ProtoSchema = new ProtoSchema();

protoschema.addSchemas(
  organizationSchema,
  locationSchema,
  notificationSchema
);
```

To encode our schemas:

```typescript
const encoded = protoschema.encode(
  'identity',
  'mapping'
);

// Our proto definitions for each namespace
console.log(encoded.identity);
console.log(encoded.mapping);
```

The encoder will also encode references from specified schemas:

```typescript
const encoded = protoschema.encode(
  'identity'
);

console.log(encoded.identity);
// This namespace is encoded because there's a message referenced by identity namespace
console.log(encoded.mapping);
```

And if you have multiple schemas within the same namespace you can pick messages passing the full message definition path:

```typescript
const encoded = protoschema.encode(
  'mapping.Location'
);

console.log(encoded.mapping);
```

When you have schemas without `$namespace` property they will be placed inside the **default** namespace:

```typescript
const encoded = protoschema.encode(
  'Notification'
);

console.log(encoded.default);
```

Note that the `organizationSchema.properties.description` can be null, and the following protobuf definition property will be generated: `bool __isNull_description = 3;`. The **\_\_isNull\_** is the default prefix to identify null values. You can change this prefix through encoder options:


```typescript
import { ProtoSchema, IEncoderOptions } from 'protoschema';

const encoderOptions: IEncoderOptions = {
  nullKeyPrefix: 'isNull'
};

const protoschema: ProtoSchema = new ProtoSchema(encoderOptions);
```