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
      'Parser',
      () => {
        it(
          'Should exists',
          () => {
            expect(encoder).to.have.property('encode').to.be.an('function');
          },
        );

        it(
          'Shoud valid json-schema',
          () => {
            expect(() => encoder.encode({})).to.throw('You must specify $id or $message property as a not empty string');
            expect(() => encoder.encode({ $id: 'Teste' })).to.throw('Your schema doesn\'t have a "propeties" attribute');
          },
        );

        it(
          'Should be all',
          () => {
            const jsonschema = {
              $id: 'mockedSchema',
              properties: {
                boolField: {
                  type: 'boolean',
                },
                doubleField: {
                  byteLength: 64,
                  type: 'number',
                },
                floatField: {
                  type: 'number',
                },
                int32Field: {
                  type: 'integer',
                },
                int64Field: {
                  byteLength: 64,
                  type: 'integer',
                },
                stringField: {
                  type: 'string',
                },
              },
              type: 'object',
            };

            const proto = encoder.encode(jsonschema);

            expect(proto).to.be.equal([
              'message mockedSchema {',
              '\tbool boolField = 1;',
              '\tdouble doubleField = 2;',
              '\tfloat floatField = 3;',
              '\tint32 int32Field = 4;',
              '\tint64 int64Field = 5;',
              '\tstring stringField = 6;',
              '}',
            ].join('\n'));
          },
        );
      },
    );
  },
);
