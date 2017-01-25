#!/usr/bin/env python
#
# Copyright 2016 University of Southern California
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


def _extract_references(value, is_stage):
    if is_stage and '{{' in value:
        return re.findall('{{(.+?)}}', value)
    elif not is_stage and '[[' in value:
        return re.findall('\[\[(.+?)\]\]', f['description'])
    return []


parser = argparse.ArgumentParser(description='Validate CRAFT JSON file.')
parser.add_argument('-s', dest='schema_file', help='CRAFT JSON schema file')
parser.add_argument('data_file', metavar='JSON_FILE', help='CRAFT JSON file')
args = parser.parse_args()

# load schema file
if args.schema_file:
    # schema file provided
    schema = json.loads(open(args.schema_file).read())
else:
    # fetching schema file from GitHub repository
    url = 'https://raw.githubusercontent.com/pegasus-isi/craft/master/schema/flow.schema.json'
    response = urllib.urlopen(url)
    schema = json.loads(response.read())

# read data file
try:
    data = json.loads(open(args.data_file).read())
except ValueError, e:
    if 'Expecting property name' in e.message:
        pos = e.message[e.message.index(':') + 1:e.message.index('(')].strip()
        print('[ERROR] JSON standard does not allow trailing comma (%s): %s' % (pos, args.data_file))
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

semantic_errors = 0

# # semantic validation
tool_ids = []
stage_ids = []
file_ids = []

stages_ref = []
files_ref = []

# loading tools
for t in data['tools']:
    tool_ids.append(t['id'])

# loading stages
for s in data['stages']:
    stage_ids.append(s['id'])

    # check whether the tool was declared
    if s['tool']['tool-id'] not in tool_ids:
        print('[ERROR] Tool "%s" is not declared in the list of tools.' % s['tool']['tool-id'])
        has_error = True
        semantic_errors += 1

    # add input files
    for f in s['inputs']['files']:
        if 'id' in f:
            if f['id'] in file_ids:
                print('[ERROR] Input file "%s (%s)" has already been declared. If this is a reference to a ' \
                      'previous file, please use the "input-id" property.' % (f['id'], s['tool']['tool-id']))
                has_error = True
                semantic_errors += 1
            else:
                file_ids.append(f['id'])

        elif 'output-id' in f:
            if f['output-id'] not in file_ids:
                print(
                    '[ERROR] Referencing non-existent output file "%s (%s)".' % (f['output-id'], s['tool']['tool-id']))
                has_error = True
                semantic_errors += 1

        if 'description' in f:
            stages_ref.extend(_extract_references(f['description'], True))
            files_ref.extend(_extract_references(f['description'], False))

        if 'notes' in f:
            stages_ref.extend(_extract_references(f['notes'], True))
            files_ref.extend(_extract_references(f['notes'], False))

    # add output files
    for f in s['outputs']['files']:
        if f['id'] in file_ids:
            print(
                '[ERROR] Output file "%s (%s)" has already been declared.' % (f['id'], s['tool']['tool-id']))
            has_error = True
            semantic_errors += 1
        else:
            file_ids.append(f['id'])

        if 'description' in f:
            stages_ref.extend(_extract_references(f['description'], True))
            files_ref.extend(_extract_references(f['description'], False))

        if 'notes' in f:
            stages_ref.extend(_extract_references(f['notes'], True))
            files_ref.extend(_extract_references(f['notes'], False))

    # flow control
    for f in s['flow-control']:
        if 'description' in f:
            stages_ref.extend(_extract_references(f['description'], True))
            files_ref.extend(_extract_references(f['description'], False))

        if 'notes' in f:
            stages_ref.extend(_extract_references(f['notes'], True))
            files_ref.extend(_extract_references(f['notes'], False))

# verifying references
for s in stages_ref:
    if s not in stage_ids:
        print('[ERROR] There is no stage named "%s" that can be referenced.' % s)
        has_error = True
        semantic_errors += 1

for f in files_ref:
    if f not in file_ids:
        print('[ERROR] There is no file named "%s" that can be referenced.' % f)
        has_error = True
        semantic_errors += 1

if has_error:
    if semantic_errors > 0:
        print('%s semantic errors were found.' % semantic_errors)
    exit(1)
else:
    print('The JSON file was successfully validated.')
