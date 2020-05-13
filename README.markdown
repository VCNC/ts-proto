
QuickStart
==========

* `npm install ts-proto`
* `protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. ./simple.proto`
  * (Note that the output param, `ts_proto_out`, is named based on the plugin's name, i.e. from the `ts_proto` suffix in the `--plugin=./node_modules/.bin/protoc-gen-ts_proto` argument becomes the `_out` prefix, per `protoc`'s CLI conventions.)

On Windows, you may need to do this instead:

* `protoc --plugin=protoc-gen-ts_proto=.\node_modules\.bin\protoc-gen-ts_proto --ts_proto_out=. ./imple.proto`

If you want to package the `ts-proto`-generated output into an npm package to distribute to clients, just run `tsc`, treating the `ts-proto`-generated files as source files, to generate the `.d.ts` files, and deploy the output as a regular npm package. (I.e. unlike pbjs/pbts, `ts-proto` creates `*.ts` source files which can then directly be used/compiled by `tsc`.)

Goals
=====

* make generated code as light as possible
    * generate type information, not actual class
    * generated code's compiled result (js file) does not have class or enum.
    * even though it means breaking some protocol buffer's behaviors

Example Types
=============

The generated types are interface,

```typescript
export interface Simple {
  name: string;
  age: number;
  createdAt?: Date;
  child?: Child;
  state?: StateEnum;
  grandChildren: Child[];
  coins: number[];
}
```

Along with `fromObject` and `Enum_fromString` method

```typescript
export namespace Simple {
  function fromObject(obj: any) : Simple {
    ...
  }
};
```

Usage
=====

`ts-proto` is a `protoc` plugin, so you run it by (either directly in your project, or more likely in your mono-repo schema pipeline, i.e. like [Ibotta](https://medium.com/building-ibotta/building-a-scaleable-protocol-buffers-grpc-artifact-pipeline-5265c5118c9d) or [Namely](https://medium.com/namely-labs/how-we-build-grpc-services-at-namely-52a3ae9e7c35)):

* Add `ts-proto` to your `package.json`
* Run `npm install` to download it
* Invoke `protoc` with a `plugin` parameter like:

```bash
protoc --plugin=node_modules/ts-proto/protoc-gen-ts_proto ./batching.proto -I.
```

Building
========

`ts-proto` does not use `pbjs` at runtime, but we do use it in the `ts-proto` build process (to bootstrap the types used to parse the incoming protobuf metadata types, as well as for the test suite to ensure the `ts-proto` implementations match the `ts-proto`).

After running `npm install`, if you need to edit google/protobug/\*.proto, run `./pbjs.sh` then *remove prototype.oneOfIndex line*
(because pbjs doesn't respect optional int, there ie no way we can know if the field is in oneOf)

After making changes to `ts-proto`, you can run `./sample/createSample.sh` to re-compile sample.proto.

RELEASE
=======

use prepare-for-release.sh.

Assumptions
===========

There are some *strong* assumptions about server side's protocol buffer's JSON Encode/Decode method & usage of proto.

* field names is in camel case when serialized to JSON.
* default value of primitive type must be in the JSON.
    * use [includingDefaultValueFields](https://developers.google.com/protocol-buffers/docs/reference/java/com/google/protobuf/util/JsonFormat.Printer.html#includingDefaultValueFields--) for Java protobuf.
* empty array/map type must be in the JSON
* for Enum
    * value in string format in JSON
    * no default value
    * if server sends enum value that client doesn't know, map it to undefined
    * no `allow_alias` option. (because string format is used for enum)
* some types is not supported
* unknown fields are not preserved.

Todo
====

Types
============

Numbers are by default assumed to be plain JavaScript `numbers`. Since protobuf supports 64 bit numbers, but JavaScript doesn't,
default behaviour is that program will misfunction when the number is larger than `Number.MAX_SAFE_INTEGER`.

Each of the protobuf types maps as following.

| Protobuf types  | Typescript types |
| ----------------------- | ----------------------- |
|  bool | boolean |
|  string | string |
|  double | number |
|  float | number |
|  int32 | number |
|  int64 | number* |
|  uint32 | number |
|  uint64 | number* |
|  sint32 | number |
|  sint64 | number* |
|  fixed32 | number |
|  fixed64 | number* |
|  sfixed32 | number |
|  sfixed64 | number* |
|  Any | NOT SUPPORTED |
|  Timestamp | NOT SUPPORTED |
|  Duration | NOT SUPPORTED |
|  message | interface &#124; undefined |
|  enum | const string enum &#124; undefined |
|  map<K,V> | { [key: K] : V } |
|  repeated V | V[] |


Where (*) indicates they might throw an error at runtime.
