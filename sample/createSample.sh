SCRIPT_DIR=$(dirname $0)
ROOT_DIR=$(dirname $SCRIPT_DIR)

npm build
protoc --plugin=$ROOT_DIR/protoc-gen-ts_proto_dev --ts_proto_out=$SCRIPT_DIR --proto_path $SCRIPT_DIR $SCRIPT_DIR/*.proto
