import { IEncodedProto, IEncoderOptions } from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';
import { encode } from './encoder';

export class ProtoSchema {

	private encoderOptions: IEncoderOptions = {};
	private schemas: Array<IJSONSchemaProto> = [];

	constructor(encoderOptions: IEncoderOptions) {

		this.encoderOptions = encoderOptions;

	}

	public validateSchema(schema: IJSONSchemaProto): void {

		if (typeof schema.$id !== 'string' || schema.$id.length === 0) {
			throw new Error('You must specify $id property as a not empty string');
		} else if (typeof schema.properties !== 'object') {
			throw new Error('Your schema doesn\'t have a "propeties" attribute');
		}

	}

	public addSchemas(...schemas: Array<IJSONSchemaProto>): ProtoSchema {

		for (const schema of schemas) {
			this.validateSchema(schema);
			this.schemas.push(schema);
		}

		return this;

	}

	public selectSchemas(...messages: Array<string>): Array<IJSONSchemaProto> {

		return this.schemas.filter((schema) => {

			let prefix: string | null = null;

			if (schema.$namespace !== undefined) {

				if (messages.includes(schema.$namespace)) {
					return true;
				}

				prefix = schema.$namespace + '.';

			}

			if (schema.$id === undefined) {
				return false;
			}

			return messages.includes(`${prefix}${schema.$id}`);

		});

	}

	public enqueueEncodingRefs(
		schemas: Array<IJSONSchemaProto>,
		proto: IEncodedProto,
		encodedMessages: Set<string>,
	): void {

		encodedMessages.add(proto.messageRef);

		for (const ref of proto.refs) {

			if (encodedMessages.has(ref)) {
				continue;
			}

			encodedMessages.add(ref);
			const [refSchema] = this.selectSchemas(ref);

			if (refSchema !== undefined) {
				schemas.push(refSchema);
			}

		}

	}

	public encode(...messages: Array<string>): Array<string> {

		const schemas: Array<IJSONSchemaProto> = this.selectSchemas(...messages);
		const protosMap = new Map<string | null, string>();
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

			let content: string = protosMap.get(proto.namespace) || proto.namespace || '';

			if (content.length > 0) {
				content += '\n\n';
			}

			protosMap.set(proto.namespace, content + proto.message + '\n\n');

			this.enqueueEncodingRefs(
				schemas,
				proto,
				encodedMessages,
			);

		}

		return Array.from(protosMap.values());

	}

}
