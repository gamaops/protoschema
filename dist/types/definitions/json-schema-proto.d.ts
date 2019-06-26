import { JSONSchema7 } from 'json-schema';
export interface IJSONSchemaProto extends JSONSchema7 {
    properties?: {
        [key: string]: IJSONSchemaProto;
    };
    byteLength?: number;
    items?: IJSONSchemaProto;
    $namespace?: string;
}
