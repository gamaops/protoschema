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

		let prefix: string = '';

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
	const uniqueRefs = Array.from(new Set<string>(proto.refs));
	const enqueuedRefs = new Set<string>();

	for (const ref of uniqueRefs) {

		if (enqueuedRefs.has(ref) || encodedMessages.has(ref)) {
			continue;
		}

		enqueuedRefs.add(ref);
		const [refSchema] = selectSchemas(
			schemas,
			[ref],
		);

		if (refSchema !== undefined) {
			queue.push(refSchema);
		}

	}

};
