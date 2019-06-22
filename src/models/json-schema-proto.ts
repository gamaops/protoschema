import { JSONSchema7 } from 'json-schema';

export interface IJsonSchemaProto extends JSONSchema7 {
  properties?: { [key: string]: IJsonSchemaProto };
  byteLength?: number;
  $message?: string;
}
