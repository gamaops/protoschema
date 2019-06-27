import { expect } from 'chai';

describe(
	'Helpers',
	() => {
		let helpers: any;
		let organizationSchema: any;
		let locationSchema: any;

		beforeEach(
			() => {

				delete require.cache[require.resolve('../mocks/location.json')];
				locationSchema = require('../mocks/location.json');

				delete require.cache[require.resolve('../mocks/organization.json')];
				organizationSchema = require('../mocks/organization.json');

				delete require.cache[require.resolve('@src/helpers')];
				helpers = require('@src/helpers');

			},
		);

		it(
			'Should exists',
			() => {
				expect(helpers).to.be.an('object');
			},
		);

		describe(
			'validateSchema',
			() => {

				it(
					'Should be exported',
					() => {
						expect(helpers).to.have.property('validateSchema').that.is.a('function');
					},
				);

				it(
					'Should throw for schema without $id',
					() => {
						expect(() => helpers.validateSchema({})).to.throw('You must specify $id property as a not empty string');
					},
				);

				it(
					'Should throw for schema without properties',
					() => {
						expect(() => helpers.validateSchema({
							$id: 'Location',
						})).to.throw('Your schema doesn\'t have a "propeties" attribute');
					},
				);

				it(
					'Should validate schema',
					() => {
						expect(() => helpers.validateSchema({
							$id: 'Location',
							properties: {},
						})).to.not.throw();
					},
				);

			},
		);

		describe(
			'selectSchemas',
			() => {

				it(
					'Should be exported',
					() => {
						expect(helpers).to.have.property('selectSchemas').that.is.a('function');
					},
				);

				it(
					'Should select schemas',
					() => {

						const selectedSchemas = helpers.selectSchemas(
							[
								organizationSchema,
								locationSchema,
							],
							[
								'mapping',
								'identity.Organization',
								'any',
							],
						);
						expect(selectedSchemas.length).to.be.equal(2);
						expect(selectedSchemas).to.contain(locationSchema);
						expect(selectedSchemas).to.contain(organizationSchema);
					},
				);

			},
		);

		describe(
			'enqueueEncodingRefs',
			() => {

				it(
					'Should be exported',
					() => {
						expect(helpers).to.have.property('enqueueEncodingRefs').that.is.a('function');
					},
				);

				it(
					'Should enqueue refs',
					() => {

						const encodedMessages = new Set<string>();
						const queue: Array<any> = [];

						helpers.enqueueEncodingRefs(
							[
								organizationSchema,
								locationSchema,
							],
							queue,
							{
								messageRef: 'identity.Organization',
								refs: [
									'mapping.Location',
									'any',
								],
							},
							encodedMessages,
						);

						expect(encodedMessages.size).to.be.equal(1);
						expect(queue.length).to.be.equal(1);
						expect(queue).to.contain(locationSchema);
					},
				);

				it(
					'Should enqueue ignore already enqueued refs',
					() => {

						const encodedMessages = new Set<string>(['mapping.Location']);
						const queue: Array<any> = [];

						helpers.enqueueEncodingRefs(
							[
								organizationSchema,
								locationSchema,
							],
							queue,
							{
								messageRef: 'identity.Organization',
								refs: [
									'mapping.Location',
								],
							},
							encodedMessages,
						);

						expect(encodedMessages.size).to.be.equal(2);
						expect(encodedMessages.has('identity.Organization')).to.be.true;
						expect(encodedMessages.has('mapping.Location')).to.be.true;
						expect(queue.length).to.be.equal(0);

					},
				);

			},
		);

	},
);
