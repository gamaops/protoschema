# ProtoSchema API Reference

### Content

* [ProtoSchema](#ProtoSchema)
	* [addSchemas](#ProtoSchema+addSchemas) adds JSON Schemas objects to the available set to be encoded
	* [encode](#ProtoSchema+encode) encodes JSON Schemas to Protobuf definitions

----------------------

<a name="ProtoSchema"></a>

## ProtoSchema

```typescript
import { ProtoSchema, IEncoderOptions } from 'protoschema';

const encoderOptions: IEncoderOptions = {};

const protoschema: ProtoSchema = new ProtoSchema(encoderOptions);
```

ProtoSchema is the main class of this package that encapsulates all the functionalities to encode JSON Schemas to Protobuf 3 definitions.

**Options**

* **encoderOptions.nullKeyPrefix** - The prefix to be concatenated to properties name to identify `null` values in protobufs messages.

----------------------

<a name="ProtoSchema+addSchemas"></a>

### addSchemas

```typescript
import { IJSONSchemaProto } from 'protoschema';

const schemas: Array<IJSONSchemaProto> = [];

protoschema.addSchemas(...schemas);
```

This method adds schemas to the available set to be encoded to protobuf definitions.

**Options**

* **...schemas** - JSON Schema objects to be added.

**Returns**

A reference to the ProtoSchema instance itself.

----------------------

<a name="ProtoSchema+encode"></a>

### encode

```typescript
const selectors: Array<string> = [];

const encoded: { [key: string]: string } = protoschema.encode(...selectors);
```

This method encodes selected schemas to protobuf defintions separated by namespaces.

**Options**

* **...selectors** - JSON Schema selectors to pick schemas to be parsed. Each selector can be:
	* The schema's `$namespace` and `$id` concatenated with a dot as glue to encode just the selected schema and the referenced schemas.
	* The schema's `$namespace` to encode all schemas from the specified namespace.
	* The schema's `$id` if the specified schema doesn't have a namespace (note that the returned object will contain the `default` attribute with the encoded result).

**Returns**

An object where keys are the encoded namespaces and values are the protobuf definitions.