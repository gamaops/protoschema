import { IEncodedProto } from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';

export const validateSchema = (schema: IJSONSchemaProto): void => {

	if (typeof schema.$id !== 'string' || schema.$id.length === 0) {
		throw new Error('You must specify $id property as a not empty string');
	} else if (typeof schema.properties !== 'object') {
		throw new Error('Your schema doesn\'t have a "propeties" attribute');
	}

};

export const selectSchemas = (
	schemas: Array<IJSONSchemaProto>,
	messages: Array<string>,
): Array<IJSONSchemaProto> => {

	return schemas.filter((schema) => {

		let prefix: string | null = null;

		if (schema.$namespace !== undefined) {

			if (messages.includes(schema.$namespace)) {
				return true;
			}

			prefix = schema.$namespace + '.';

		}

		return messages.includes(`${prefix}${schema.$id}`);

	});

};

export const enqueueEncodingRefs = (
	schemas: Array<IJSONSchemaProto>,
	queue: Array<IJSONSchemaProto>,
	proto: IEncodedProto,
	encodedMessages: Set<string>,
): void => {

	encodedMessages.add(proto.messageRef);

	for (const ref of proto.refs) {

		if (encodedMessages.has(ref)) {
			continue;
		}

		encodedMessages.add(ref);
		const [refSchema] = selectSchemas(
			schemas,
			[ref],
		);

		if (refSchema !== undefined) {
			queue.push(refSchema);
		}

	}

};
