import { IEncoderOptions } from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';
import { encode } from './encoder';
import {
	enqueueEncodingRefs,
	selectSchemas,
	validateSchema,
} from './helpers';

export class ProtoSchema {

	private encoderOptions: IEncoderOptions;
	private schemas: Array<IJSONSchemaProto> = [];

	constructor(encoderOptions: IEncoderOptions = {}) {

		this.encoderOptions = encoderOptions;

	}

	public addSchemas(...schemas: Array<IJSONSchemaProto>): ProtoSchema {

		for (const schema of schemas) {
			validateSchema(schema);
			this.schemas.push(schema);
		}

		return this;

	}

	public encode(...messages: Array<string>): { [key: string]: string } {

		const schemas: Array<IJSONSchemaProto> = selectSchemas(
			this.schemas,
			messages,
		);
		const protosMap: { [key: string]: string } = {};
		const encodedMessages = new Set<string>();

		while (schemas.length > 0) {

			const schema = schemas.shift() as IJSONSchemaProto;

			const proto = encode(
				schema,
				this.encoderOptions,
			);

			if (encodedMessages.has(proto.messageRef)) {
				continue;
			}

			const key = schema.$namespace || 'default';
			let content: string = protosMap[key] || proto.namespace || '';

			if (content.length > 0) {
				content += '\n\n';
			}

			protosMap[key] = content + proto.message;

			enqueueEncodingRefs(
				this.schemas,
				schemas,
				proto,
				encodedMessages,
			);

		}

		return protosMap;

	}

}
