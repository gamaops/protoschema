import { IJsonSchemaProto } from './models/json-schema-proto';
import { ProtobufTypes } from './models/protobuf-types';

export const Encoder = {
  parser(schema: IJsonSchemaProto): string {
    const message = schema.$message || schema.$id;

    if (typeof message !== 'string' || message.length === 0) {
      throw new Error('should have a property $id or $message');
    }

    const proto: Array<string> = [];
    let counter = 1;

    proto.unshift(`message ${message} {`);

    if (typeof schema.properties !== 'object') {
      throw new Error('should have a property properties');
    }

    for (const k in schema.properties) {
      const property: IJsonSchemaProto = schema.properties[k] as IJsonSchemaProto;

      if (typeof property === 'object' && 'type' in property) {
        let type: any = '';

        switch (property.type) {
          case 'number':
          case 'integer':
            type = `${property.type}${property.byteLength || '32'}`;
            break;

          default:
            type = property.type;
            break;
        }

        proto.push(`\t${ProtobufTypes[type]} ${k} = ${counter++};`);
      }
    }

    proto.push('}');

    return proto.join('\n');
  },
};
