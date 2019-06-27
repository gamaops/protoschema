# ProtoSchema

[![NPM](https://nodei.co/npm/protoschema.png)](https://nodei.co/npm/protoschema/)

![GitHub](https://img.shields.io/github/license/exocet-engineering/protoschema.svg)
![npm](https://img.shields.io/npm/dw/protoschema.svg)
![npm](https://img.shields.io/npm/v/protoschema.svg)
![npm type definitions](https://img.shields.io/npm/types/protoschema.svg)

ProtoSchema is the coolest JSON Schema 7 to Protobuf 3 definitions encoder.

* It's written in TypeScript and transpiled to Javascript
* The encoder is aware about messages references and will encode them when one is found in the picked schema to be encoded
* The encoded result is separated by namespaces
* You can use `null` on Protobuf 3 with the boolean field flag technique
* You can specify the byte length for numbers and integers
* It's unit tested to be bulletproof
* Zero dependency

```
npm install --save protoschema
```

## Guide

To learn quickly how to use the package go to the [guide](docs/GUIDE.md).

## API Reference

To understand more about the exported interface go to the [API reference](docs/API_REFERENCE.md).

## Contributing

See the [contributing guide](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT license.

Copyright © 2019 [codermarcos](https://github.com/codermarcos) and [vflopes](https://github.com/vflopes)