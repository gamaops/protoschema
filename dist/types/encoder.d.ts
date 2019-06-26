import { JSONSchema7TypeName } from 'json-schema';
import { IEncodedProto, IEncoderOptions, IPropertySpecification, ITypeSpecification } from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';
export declare const parseType: (sourceType: "string" | "number" | "boolean" | "object" | "integer" | "array" | "null" | JSONSchema7TypeName[] | undefined, byteLength?: number) => ITypeSpecification | null;
export declare const parseRefType: (property: IJSONSchemaProto, refs: string[]) => ITypeSpecification | null;
export declare const parseArrayType: (property: IJSONSchemaProto, refs: string[]) => ITypeSpecification | null;
export declare const parseProperty: (property: IJSONSchemaProto, refs: string[]) => IPropertySpecification | null;
export declare const encode: (schema: IJSONSchemaProto, options?: IEncoderOptions) => IEncodedProto;
