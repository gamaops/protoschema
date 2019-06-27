'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var defaultEncoderOptions = {
    nullKeyPrefix: '__isNull_',
};

var ProtobufTypes;
(function (ProtobufTypes) {
    ProtobufTypes["string"] = "string";
    ProtobufTypes["integer32"] = "int32";
    ProtobufTypes["integer64"] = "int64";
    ProtobufTypes["number32"] = "float";
    ProtobufTypes["number64"] = "double";
    ProtobufTypes["boolean"] = "bool";
})(ProtobufTypes || (ProtobufTypes = {}));

var parseType = function (sourceType, byteLength) {
    if (byteLength === void 0) { byteLength = 32; }
    if (sourceType === undefined) {
        return null;
    }
    var types = Array.isArray(sourceType) ? sourceType : [sourceType];
    var schemaType = types.find(function (type) { return type !== 'null'; });
    if (schemaType === undefined) {
        return null;
    }
    if (schemaType === 'number'
        || schemaType === 'integer') {
        schemaType += byteLength;
    }
    if (!(schemaType in ProtobufTypes)) {
        return null;
    }
    return {
        isNullable: types.includes('null'),
        protobufType: ProtobufTypes[schemaType],
    };
};
var parseRefType = function (property, refs) {
    if (property.$ref !== undefined) {
        var types = Array.isArray(property.type) ? property.type : [property.type];
        var protobufType = "" + (property.$namespace ? property.$namespace + '.' : '') + property.$ref;
        if (!refs.includes(protobufType)) {
            refs.push(protobufType);
        }
        return {
            isNullable: types.includes('null'),
            protobufType: protobufType,
        };
    }
    return null;
};
var parseArrayType = function (property, refs) {
    if (property.items !== undefined) {
        if (property.items.$ref !== undefined) {
            return parseRefType(property.items, refs);
        }
        return parseType(property.items.type, property.items.byteLength);
    }
    return null;
};
var parseProperty = function (property, refs) {
    var parsedType = null;
    var prefix = '';
    if (property.type === 'array') {
        parsedType = parseArrayType(property, refs);
        if (parsedType !== null) {
            prefix = 'repeated ';
        }
    }
    else if (property.$ref !== undefined) {
        parsedType = parseRefType(property, refs);
    }
    if (parsedType === null) {
        parsedType = parseType(property.type, property.byteLength);
    }
    if (parsedType === null) {
        return null;
    }
    return __assign({}, parsedType, { prefix: prefix });
};
var encode = function (schema, options) {
    if (options === void 0) { options = defaultEncoderOptions; }
    options = __assign({}, defaultEncoderOptions, options);
    var refs = [];
    var namespaceProto = null;
    var messageRef = '';
    if (schema.$namespace !== undefined) {
        namespaceProto = "package " + schema.$namespace + ";";
        messageRef = schema.$namespace + '.';
    }
    messageRef += schema.$id;
    var messageProto = ["message " + schema.$id + " {"];
    var counter = 1;
    for (var key in schema.properties) {
        var property = schema.properties[key];
        if (typeof property === 'object' && property.type !== undefined) {
            var parsedProperty = parseProperty(property, refs);
            if (parsedProperty === null) {
                continue;
            }
            messageProto.push("\t" + parsedProperty.prefix + parsedProperty.protobufType + " " + key + " = " + counter++ + ";");
            if (parsedProperty.isNullable && options.nullKeyPrefix) {
                messageProto.push("\tbool " + options.nullKeyPrefix + key + " = " + counter++ + ";");
            }
        }
    }
    messageProto.push('}');
    return {
        message: messageProto.join('\n'),
        messageRef: messageRef,
        namespace: namespaceProto,
        refs: refs,
    };
};

var validateSchema = function (schema) {
    if (typeof schema.$id !== 'string' || schema.$id.length === 0) {
        throw new Error('You must specify $id property as a not empty string');
    }
    else if (typeof schema.properties !== 'object') {
        throw new Error('Your schema doesn\'t have a "propeties" attribute');
    }
};
var selectSchemas = function (schemas, messages) {
    return schemas.filter(function (schema) {
        var prefix = '';
        if (schema.$namespace !== undefined) {
            if (messages.includes(schema.$namespace)) {
                return true;
            }
            prefix = schema.$namespace + '.';
        }
        return messages.includes("" + prefix + schema.$id);
    });
};
var enqueueEncodingRefs = function (schemas, queue, proto, encodedMessages) {
    encodedMessages.add(proto.messageRef);
    var uniqueRefs = Array.from(new Set(proto.refs));
    var enqueuedRefs = new Set();
    for (var _i = 0, uniqueRefs_1 = uniqueRefs; _i < uniqueRefs_1.length; _i++) {
        var ref = uniqueRefs_1[_i];
        if (enqueuedRefs.has(ref) || encodedMessages.has(ref)) {
            continue;
        }
        enqueuedRefs.add(ref);
        var refSchema = selectSchemas(schemas, [ref])[0];
        if (refSchema !== undefined) {
            queue.push(refSchema);
        }
    }
};

var ProtoSchema = (function () {
    function ProtoSchema(encoderOptions) {
        if (encoderOptions === void 0) { encoderOptions = {}; }
        this.schemas = [];
        this.encoderOptions = encoderOptions;
    }
    ProtoSchema.prototype.addSchemas = function () {
        var schemas = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            schemas[_i] = arguments[_i];
        }
        for (var _a = 0, schemas_1 = schemas; _a < schemas_1.length; _a++) {
            var schema = schemas_1[_a];
            validateSchema(schema);
            this.schemas.push(schema);
        }
        return this;
    };
    ProtoSchema.prototype.encode = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        var schemas = selectSchemas(this.schemas, messages);
        var protosMap = {};
        var encodedMessages = new Set();
        while (schemas.length > 0) {
            var schema = schemas.shift();
            var proto = encode(schema, this.encoderOptions);
            if (encodedMessages.has(proto.messageRef)) {
                continue;
            }
            var key = schema.$namespace || 'default';
            var content = protosMap[key] || proto.namespace || '';
            if (content.length > 0) {
                content += '\n\n';
            }
            protosMap[key] = content + proto.message;
            enqueueEncodingRefs(this.schemas, schemas, proto, encodedMessages);
        }
        return protosMap;
    };
    return ProtoSchema;
}());

exports.ProtoSchema = ProtoSchema;
