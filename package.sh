#!/bin/bash

BUNDLE_DIR="${BUNDLE_DIR:-../bundles/$(jq -r '.name' pc2.json)-bundles}"

increment_version() {
    if [ -f ./pc2.json ]; then
        VERSION=$(jq -r '.version' pc2.json)
        IFS='.' read -r -a VERSION_PARTS <<< "$VERSION"
        ((VERSION_PARTS[2]++))
        NEW_VERSION="${VERSION_PARTS[0]}.${VERSION_PARTS[1]}.${VERSION_PARTS[2]}"
        jq --arg new_version "$NEW_VERSION" '.version = $new_version' pc2.json > tmp.$$.json && mv tmp.$$.json pc2.json
        echo "Incremented version to $NEW_VERSION in pc2.json"
    else
        echo 'pc2.json not found'
    fi
}

increment_flag=false

while getopts ":ia" opt; do
  case $opt in
    i)
        increment_flag=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

$increment_flag && increment_version
mkdir -p "$BUNDLE_DIR"
syndi package . --output-dir "$BUNDLE_DIR"
