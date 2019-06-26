import { JSONSchema7TypeName } from 'json-schema';
import {
	defaultEncoderOptions,
	IEncodedProto,
	IEncoderOptions,
	IPropertySpecification,
	ITypeSpecification,
} from './definitions/encoder';
import { IJSONSchemaProto } from './definitions/json-schema-proto';
import { ProtobufTypes } from './definitions/protobuf-types';

export const parseType = (
	sourceType: Array<JSONSchema7TypeName> | JSONSchema7TypeName | undefined,
	byteLength: number = 32,
): ITypeSpecification | null => {

	if (sourceType === undefined) {
		return null;
	}

	const types: Array<string> = Array.isArray(sourceType) ? sourceType : [sourceType];
	let schemaType: string | undefined = types.find(type => type !== 'null');

	if (schemaType === undefined) {
		return null;
	}

	if (
		schemaType === 'number'
		|| schemaType === 'integer'
	) {
		schemaType += byteLength;
	}

	if (!(schemaType in ProtobufTypes)) {
		return null;
	}

	return {
		isNullable: types.includes('null'),
		protobufType: ProtobufTypes[schemaType as any],
	};

};

export const parseRefType = (property: IJSONSchemaProto, refs: Array<string>): ITypeSpecification | null => {

	if (property.$ref !== undefined) {

		const types: Array<JSONSchema7TypeName | undefined> = Array.isArray(property.type) ? property.type : [property.type];
		const protobufType: string = `${property.$namespace ? property.$namespace + '.' : ''}${property.$ref}`;

		if (!refs.includes(protobufType)) {
			refs.push(protobufType);
		}

		return {
			isNullable: types.includes('null'),
			protobufType,
		};

	}

	return null;

};

export const parseArrayType = (property: IJSONSchemaProto, refs: Array<string>): ITypeSpecification | null => {

	if (property.items !== undefined) {

		if (property.items.$ref !== undefined) {
			return parseRefType(property.items, refs);
		}

		return parseType(property.items.type, property.items.byteLength);

	}

	return null;

};

export const parseProperty = (property: IJSONSchemaProto, refs: Array<string>): IPropertySpecification | null => {

	let parsedType: ITypeSpecification | null = null;
	let prefix: string = '';

	if (property.type === 'array') {
		parsedType = parseArrayType(property, refs);
		if (parsedType !== null) {
			prefix = 'repeated ';
		}
	} else if (property.$ref !== undefined) {
		parsedType = parseRefType(property, refs);
	}

	if (parsedType === null) {
		parsedType = parseType(property.type, property.byteLength);
	}

	if (parsedType === null) {
		return null;
	}

	return {
		...parsedType,
		prefix,
	};

};

export const encode = (
	schema: IJSONSchemaProto,
	options: IEncoderOptions = defaultEncoderOptions,
): IEncodedProto => {

	options = {
		...defaultEncoderOptions,
		...options,
	};

	const refs: Array<string> = [];

	let namespaceProto: string | null = null;
	let messageRef: string = '';

	if (schema.$namespace !== undefined) {
		namespaceProto = `package ${schema.$namespace};`;
		messageRef = schema.$namespace + '.';
	}

	messageRef += schema.$id;

	const messageProto: Array<string> = [`message ${schema.$id} {`];

	let counter = 1;

	for (const key in schema.properties) {

		const property: IJSONSchemaProto = schema.properties[key] as IJSONSchemaProto;

		if (typeof property === 'object' && property.type !== undefined) {

			const parsedProperty = parseProperty(property, refs);

			if (parsedProperty === null) {
				continue;
			}

			messageProto.push(`\t${parsedProperty.prefix}${parsedProperty.protobufType} ${key} = ${counter++};`);

			if (parsedProperty.isNullable) {
				messageProto.push(`\tbool ${options.nullKeyPrefix}${key} = ${counter++};`);
			}

		}

	}

	messageProto.push('}');

	return {
		message: messageProto.join('\n'),
		messageRef,
		namespace: namespaceProto,
		refs,
	};

};
