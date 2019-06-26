import { IEncodedProto } from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';
export declare const validateSchema: (schema: IJSONSchemaProto) => void;
export declare const selectSchemas: (schemas: IJSONSchemaProto[], messages: string[]) => IJSONSchemaProto[];
export declare const enqueueEncodingRefs: (schemas: IJSONSchemaProto[], queue: IJSONSchemaProto[], proto: IEncodedProto, encodedMessages: Set<string>) => void;
