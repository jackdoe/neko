#!/bin/bash
base=`dirname $0`
for level in beginner advanced intermediate; do
    for language in ja nl; do
        dir="$base/$language/$level"
        if [ ! -d $dir ] || [ ! "$(ls -A $dir)" ]; then
            mkdir -p $dir
            echo '{"q":"not supported yet", "a":"not supported yet"}' > $dir/not_supported.json
        fi
    done
done
