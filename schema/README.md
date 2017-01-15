# CRAFT JSON Schema

## Validating a CRAFT flow JSON file

In order to validate a CRAFT flow JSON file, we provide a schema validator tool (`craft-schema-validator.py`), which validates both the _syntax_ and the _semantics_ of the JSON file. 

The validator tool can be used as follows:
```
$ ./craft-schema-validator.py JSON_FILE
```

**Note:** the validator requires the `jsonschema` Python package. To install the package, use the following command:
```
pip install jsonschema
```
