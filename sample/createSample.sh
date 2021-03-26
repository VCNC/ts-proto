SCRIPT_DIR=$(dirname $0)
ROOT_DIR=$(dirname $SCRIPT_DIR)

npm run-script build
protoc --plugin=$ROOT_DIR/protoc-gen-ts_dev_proto --ts_dev_proto_out=$SCRIPT_DIR --proto_path $SCRIPT_DIR $SCRIPT_DIR/*.proto
