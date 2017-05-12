#!/usr/bin/env python
#
# Copyright 2017 University of Southern California
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import argparse
import json
import jsonschema
import re
import urllib

__author__ = "Rafael Ferreira da Silva"


parser = argparse.ArgumentParser(description='Validate IP JSON file.')
parser.add_argument('-s', dest='schema_file', help='IP JSON schema file')
parser.add_argument('data_file', metavar='JSON_FILE', help='IP JSON file')
args = parser.parse_args()

# load schema file
if args.schema_file:
    # schema file provided
    schema = json.loads(open(args.schema_file).read())
else:
    # fetching schema file from GitHub repository
    url = 'https://raw.githubusercontent.com/pegasus-isi/craft/master/schema/ip.schema.json'
    response = urllib.urlopen(url)
    schema = json.loads(response.read())

# read data file
try:
    data = json.loads(open(args.data_file).read())
except ValueError as e:
    if 'Expecting property name' in e.message:
        pos = e.message[e.message.index(':') + 1:e.message.index('(')].strip()
        print('[ERROR] JSON standard does not allow trailing comma (%s): %s' % (pos, args.data_file))
    else:
        print('[ERROR] %s ' % e)
    exit(1)

# validate against schema
v = jsonschema.Draft4Validator(schema)
has_error = False
for error in sorted(v.iter_errors(data), key=str):
    msg = '[ERROR] ' + ' > '.join([str(e) for e in error.relative_path]) \
          + ': ' + error.message
    print(msg)
    has_error = True

if has_error:
    exit(1)
else:
    print('The JSON file was successfully validated.')
