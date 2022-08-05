#!/bin/sh

coverage = $(`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' 'build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html' | head -1`)
