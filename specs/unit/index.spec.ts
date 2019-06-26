import { expect } from 'chai';
import mock from 'mock-require';
import sinon from 'sinon';

describe(
	'index',
	() => {
		let index: any;
		let encoder: any;
		let helpers: any;
		let protoOne: any;
		let protoTwo: any;
		let protoThree: any;
		let schemas: any;

		beforeEach(
			() => {

				protoOne = {
										message: 'message Location {}',
										messageRef: 'mapping.Location',
										namespace: 'package mapping;',
								};

				protoTwo = {
										message: 'message Organization {}',
										messageRef: 'identity.Organization',
										namespace: 'package identity;',
								};

				protoThree = {
										message: 'message Any {}',
										messageRef: 'Any',
										namespace: null,
								};

				const encode = sinon.stub();
				encode.onCall(0).returns(protoOne);
				encode.onCall(1).returns(protoTwo);
				encode.onCall(2).returns(protoTwo);
				encode.onCall(3).returns(protoThree);

				const selectSchemas = sinon.stub();
				schemas = [
					{
						$namespace: 'mapping',
					},
					{
						$namespace: 'identity',
					},
					{
						$namespace: 'identity',
					},
					{},
				];
				selectSchemas.returns(schemas);

				const enqueueEncodingRefs = sinon.spy((
					sourceSchemas,
					queue,
					proto,
					encodedMessages,
				) => {
					encodedMessages.add(proto.messageRef);
				});

				helpers = {
										enqueueEncodingRefs,
										selectSchemas,
										validateSchema: sinon.stub(),
								};
				mock(require.resolve('@src/helpers.ts'), helpers);
				encoder = {
					encode,
				};
				mock(require.resolve('@src/encoder.ts'), encoder);

				delete require.cache[require.resolve('@src/index')];
				index = require('@src/index');

			},
		);

		it(
			'Should exists',
			() => {
				expect(index).to.be.an('object');
			},
		);

		describe(
			'ProtoSchema',
			() => {

				it(
					'Should be exported',
					() => {
						expect(index).to.have.property('ProtoSchema').that.is.a('function');
					},
				);

				it(
					'Should add valid schemas',
					() => {

						const schema = {};
						const protoschema = new index.ProtoSchema();
						expect(protoschema.addSchemas(schema)).to.be.equal(protoschema);
						sinon.assert.calledOnce(helpers.validateSchema);
						expect(
							helpers.validateSchema.getCall(0).args[0],
						).to.be.equal(schema);

					},
				);

				it(
					'Should encode schemas',
					() => {

						const schema = {};
						const options = {};
						const protoschema = new index.ProtoSchema(options);
						const encoded = protoschema.addSchemas(schema).encode('identity.Organization');

						expect(encoded).to.be.an('object');
						expect(encoded).to.have.property('default');
						expect(encoded.default).to.be.equal('message Any {}');
						expect(encoded).to.have.property('identity');
						expect(encoded.identity).to.be.equal('package identity;\n\nmessage Organization {}');
						expect(encoded).to.have.property('mapping');
						expect(encoded.mapping).to.be.equal('package mapping;\n\nmessage Location {}');

						let callResult: any;

						sinon.assert.callCount(helpers.selectSchemas, 1);
						callResult = helpers.selectSchemas.getCall(0).args;
						expect(callResult[0]).to.be.an('array');
						expect(callResult[0].length).to.be.equal(1);
						expect(callResult[0][0]).to.be.equal(schema);
						expect(callResult[1]).to.be.an('array');
						expect(callResult[1].length).to.be.equal(1);
						expect(callResult[1][0]).to.be.equal('identity.Organization');

						const schemasArray = callResult[0];

						sinon.assert.callCount(helpers.enqueueEncodingRefs, 3);
						callResult = helpers.enqueueEncodingRefs.getCall(0).args;
						expect(callResult[0]).to.be.equal(schemasArray);
						expect(callResult[1]).to.be.equal(schemas);
						expect(callResult[2]).to.be.equal(protoOne);
						expect(callResult[3]).to.be.instanceOf(Set);
						callResult = helpers.enqueueEncodingRefs.getCall(1).args;
						expect(callResult[0]).to.be.equal(schemasArray);
						expect(callResult[1]).to.be.equal(schemas);
						expect(callResult[2]).to.be.equal(protoTwo);
						expect(callResult[3]).to.be.instanceOf(Set);
						callResult = helpers.enqueueEncodingRefs.getCall(2).args;
						expect(callResult[0]).to.be.equal(schemasArray);
						expect(callResult[1]).to.be.equal(schemas);
						expect(callResult[2]).to.be.equal(protoThree);
						expect(callResult[3]).to.be.instanceOf(Set);

						sinon.assert.callCount(encoder.encode, 4);
						callResult = encoder.encode.getCall(0).args;
						expect(callResult[0]).to.be.an('object');
						expect(callResult[0].$namespace).to.be.equal('mapping');
						expect(callResult[1]).to.be.equal(options);
						callResult = encoder.encode.getCall(1).args;
						expect(callResult[0]).to.be.an('object');
						expect(callResult[0].$namespace).to.be.equal('identity');
						expect(callResult[1]).to.be.equal(options);
						callResult = encoder.encode.getCall(2).args;
						expect(callResult[0]).to.be.an('object');
						expect(callResult[0].$namespace).to.be.equal('identity');
						expect(callResult[1]).to.be.equal(options);
						callResult = encoder.encode.getCall(3).args;
						expect(callResult[0]).to.be.an('object');
						expect(callResult[0].$namespace).to.be.undefined;
						expect(callResult[1]).to.be.equal(options);

					},
				);

			},
		);

	},
);
