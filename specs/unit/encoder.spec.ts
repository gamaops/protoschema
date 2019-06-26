import { expect } from 'chai';

describe(
	'Encoder',
	() => {
		let encoder: any;

		beforeEach(
			() => {
				delete require.cache[require.resolve('@src/encoder')];
				encoder = require('@src/encoder');
			},
		);

		it(
			'Should exists',
			() => {
				expect(encoder).to.be.an('object');
			},
		);

		describe(
			'parseType',
			() => {
				it(
					'Should be exported',
					() => {
						expect(encoder).to.have.property('parseType').that.is.a('function');
					},
				);

				it(
					'Shoud return null if sourceType is undefined',
					() => {
						expect(encoder.parseType(undefined)).to.be.equal(null);
					},
				);

				it(
					'Shoud return null is invalid type',
					() => {
						expect(encoder.parseType('invalidType')).to.be.equal(null);
					},
				);

				it(
					'Shoud return null is type is null',
					() => {
						expect(encoder.parseType('null')).to.be.equal(null);
					},
				);

				it(
					'Shoud return null is invalid array of types',
					() => {
						expect(encoder.parseType(['null', 'invalidType'])).to.be.equal(null);
					},
				);

				it(
					'Shoud return null is array of null type',
					() => {
						expect(encoder.parseType(['null'])).to.be.equal(null);
					},
				);

				it(
					'Shoud return protobuf type for number (default byte length 32)',
					() => {

						let protoType = encoder.parseType(['null', 'number'])
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('float');
						protoType = encoder.parseType('number')
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('float');

					},
				);

				it(
					'Shoud return protobuf type for number (byte length 64)',
					() => {

						let protoType = encoder.parseType(['null', 'number'], 64)
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('double');
						protoType = encoder.parseType('number', 64)
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('double');

					},
				);

				it(
					'Shoud return protobuf type for integer (default byte length 32)',
					() => {

						let protoType = encoder.parseType(['null', 'integer'])
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('int32');
						protoType = encoder.parseType('integer')
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('int32');

					},
				);

				it(
					'Shoud return protobuf type for integer (byte length 64)',
					() => {

						let protoType = encoder.parseType(['null', 'integer'], 64)
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('int64');
						protoType = encoder.parseType('integer', 64)
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('int64');

					},
				);

				it(
					'Shoud return protobuf type for string',
					() => {

						let protoType = encoder.parseType(['null', 'string'])
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('string');
						protoType = encoder.parseType('string')
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('string');

					},
				);

				it(
					'Shoud return protobuf type for boolean',
					() => {

						let protoType = encoder.parseType(['null', 'boolean'])
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('bool');
						protoType = encoder.parseType('boolean')
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('bool');

					},
				);

			},
		);

		describe(
			'parseRefType',
			() => {

				it(
					'Should be exported',
					() => {
						expect(encoder).to.have.property('parseRefType').that.is.a('function');
					},
				);

				it(
					'Should return null if $ref is undefined',
					() => {

						const refs: Array<string> = [];
						const protoType = encoder.parseRefType({}, refs);
						expect(protoType).to.be.equal(null);
						expect(refs.length).to.be.equal(0);

					},
				);

				it(
					'Should return protobuf reference without namespace',
					() => {

						let refs: Array<string> = [];
						let protoType = encoder.parseRefType({
							$ref: 'Location'
						}, refs);
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('Location');
						expect(refs.length).to.be.equal(1);
						expect(refs[0]).to.be.equal('Location');

						refs = [];
						protoType = encoder.parseRefType({
							type: ['object', 'null'],
							$ref: 'Location'
						}, refs);
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('Location');
						expect(refs.length).to.be.equal(1);
						expect(refs[0]).to.be.equal('Location');

					},
				);

				it(
					'Should return protobuf reference with namespace',
					() => {

						let refs: Array<string> = [];
						let protoType = encoder.parseRefType({
							$ref: 'Location',
							$namespace: 'mapping'
						}, refs);
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.false;
						expect(protoType.protobufType).to.be.equal('mapping.Location');
						expect(refs.length).to.be.equal(1);
						expect(refs[0]).to.be.equal('mapping.Location');

						refs = [];
						protoType = encoder.parseRefType({
							type: ['object', 'null'],
							$ref: 'Location',
							$namespace: 'mapping'
						}, refs);
						expect(protoType).to.be.an('object');
						expect(protoType.isNullable).to.be.true;
						expect(protoType.protobufType).to.be.equal('mapping.Location');
						expect(refs.length).to.be.equal(1);
						expect(refs[0]).to.be.equal('mapping.Location');

					},
				);

			}
		);

		describe(
			'parseArrayType',
			() => {

				it(
					'Should be exported',
					() => {
						expect(encoder).to.have.property('parseArrayType').that.is.a('function');
					},
				);

				it(
					'Should return null if items is undefined',
					() => {
						
						const refs: Array<any> = [];
						const protoType = encoder.parseArrayType({}, refs);
						expect(protoType).to.be.equal(null);
						expect(refs.length).to.be.equal(0);
						
					},
				);

				it(
					'Should return protobuf type for items type',
					() => {
						
						const refs: Array<any> = [];
						const protoType = encoder.parseArrayType({
							items: {
								type: 'string'
							}
						}, refs);
						expect(protoType).to.be.an('object');
						expect(protoType.protobufType).to.be.equal('string');
						expect(refs.length).to.be.equal(0);

					},
				);

				it(
					'Should return protobuf reference for items ref',
					() => {
						
						const refs: Array<any> = [];
						const protoType = encoder.parseArrayType({
							items: {
								$ref: 'Location',
								$namespace: 'mapping'
							}
						}, refs);
						expect(protoType).to.be.an('object');
						expect(protoType.protobufType).to.be.equal('mapping.Location');
						expect(refs.length).to.be.equal(1);
						expect(refs[0]).to.be.equal('mapping.Location')

					},
				);

			}
		);

		describe(
			'parseProperty',
			() => {

				it(
					'Should be exported',
					() => {
						expect(encoder).to.have.property('parseProperty').that.is.a('function');
					},
				);

				it(
					'Should return null for invalid type',
					() => {

						const refs: Array<string> = [];
						expect(encoder.parseProperty({
							type: 'invalidType'
						}, refs)).to.be.equal(null);
						expect(refs.length).to.be.equal(0);
					},
				);

				it(
					'Should parse primitive type',
					() => {

						const refs: Array<string> = [];
						const protoType = encoder.parseProperty({
							type: 'string'
						}, refs);
						expect(protoType.protobufType).to.be.equal('string');
						expect(protoType.isNullable).to.be.equal(false);
						expect(protoType.prefix).to.be.equal('');
						expect(refs.length).to.be.equal(0);
					},
				);

				it(
					'Should parse array type',
					() => {

						const refs: Array<string> = [];
						const protoType = encoder.parseProperty({
							type: 'array',
							items: {
								type: 'string'
							}
						}, refs);
						expect(protoType.protobufType).to.be.equal('string');
						expect(protoType.isNullable).to.be.equal(false);
						expect(protoType.prefix).to.be.equal('repeated ');
						expect(refs.length).to.be.equal(0);
					},
				);

				it(
					'Should parse reference',
					() => {

						const refs: Array<string> = [];
						const protoType = encoder.parseProperty({
							$ref: 'Location',
							$namespace: 'mapping'
						}, refs);
						expect(protoType.protobufType).to.be.equal('mapping.Location');
						expect(protoType.isNullable).to.be.equal(false);
						expect(protoType.prefix).to.be.equal('');
						expect(refs.length).to.be.equal(1);
						expect(refs[0]).to.be.equal('mapping.Location');
					},
				);

			}
		);

	},
);
