export interface ITypeSpecification {
	protobufType: string;
	isNullable: boolean;
}

export interface IPropertySpecification extends ITypeSpecification {
	prefix?: string;
}

export interface IEncodedProto {
	namespace: string | null;
	message: string;
	messageRef: string;
	refs: Array<string>;
}

export interface IEncoderOptions {
	nullKeyPrefix?: string;
}

export const defaultEncoderOptions: IEncoderOptions = {
	nullKeyPrefix: '__isNull_',
};
