#!/bin/sh

coverage_threshold=80
coverage=`grep -o -P '(?<=<span class="strong">).*(?=% </span>)' build/test/coverage/HeadlessChrome\\ 74.0.3723\\ \\(Linux\\ 0.0.0\\)/lcov-report/index.html | head -1`;
coverage_int=`awk -v var="$coverage" 'BEGIN {print int(var)}'`
echo "Current test coverage: $coverage%.";
if [ $coverage_int -lt $coverage_threshold ];
then
    echo "Error: current test coverage is less than $coverage_threshold%, please add unit tests before push code to ensure test coverage reaches $coverage_threshold%.";
else
  echo "Congratulations! Test coverage is more than $coverage_threshold%."
fi;