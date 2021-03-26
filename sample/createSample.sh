SCRIPT_DIR=$(dirname $0)
ROOT_DIR=$(dirname $SCRIPT_DIR)

npm run-script build
echo "change the protoc-gen-ts_proto to point at build/plugin"
protoc --plugin=$ROOT_DIR/protoc-gen-ts_proto --ts_proto_out=$SCRIPT_DIR --proto_path $SCRIPT_DIR $SCRIPT_DIR/*.proto
