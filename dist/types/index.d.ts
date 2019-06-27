import { IEncoderOptions } from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';
export { IJSONSchemaProto, IEncoderOptions, };
export declare class ProtoSchema {
    private encoderOptions;
    private schemas;
    constructor(encoderOptions?: IEncoderOptions);
    addSchemas(...schemas: Array<IJSONSchemaProto>): ProtoSchema;
    encode(...messages: Array<string>): {
        [key: string]: string;
    };
}
