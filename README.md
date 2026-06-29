[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

<img class="screenshot" src="https://user-images.githubusercontent.com/98138701/169650464-ac7e1d8a-0050-4368-9331-2b3645cfc994.png" width="276px"/>

A Github action for validating .yaml files using JSON schemas

## Usage

You can now consume the action by referencing the available version.

```yaml
uses: step-security/yaml-schema-checker@v0
with:
  jsonSchemaFile: schemas/example.schema.json
  yamlFiles: folder/subfolder/**/*.yml
```

or you can use combine patterns and files as array:

```yaml
uses: step-security/yaml-schema-checker@v0
with:
  jsonSchemaFile: schemas/example.schema.json
  yamlFiles: |
    file_1.yml,file_2.yml # two files in the same line
    file_3.yml
    folder/subfolder/**/*.yml
```

This project uses [glob](https://www.npmjs.com/package/glob) to read files

## Input

### `jsonSchemaFile`

**Required** A JSON schema file following the format used at https://www.schemastore.org

### `yamlFiles`

**Required** A list of files, directories, and wildcard patterns to be validated


### `filesSeparator`

**Optional** Separator used to split the files input. Default is `,` (comma).

## Outputs

### `validFiles`

Comma separated list of files that passed

### `invalidFiles`

Comma separated list of files that failed

## Log

If you run this GitHub Actions, this is what the log information looks like:

```bash
Run step-security/yaml-schema-checker@v0
Json Schema: schemas/example.schema.json
Yaml Files: folder/subfolder/**/*.yml
Found 4 file(s). Checking them:
❌ folder/subfolder/events/fake1.yml
    - instance.type is not one of enum values: conference,workshop,symposium
✅ folder/subfolder/events/fake2.yml
❌ folder/subfolder/events/fake3.yml
    - instance.id is not of a type(s) string
    - instance.type is not one of enum values: conference,workshop,symposium
❌ folder/subfolder/events/fake4.yml
    - instance.title is not of a type(s) string
Done. All files checked

Error: It was found 3 invalid file(s)
```

## For Developers

Install the dependencies

```bash
npm install
```

Run the development enviroment

```bash
npm run dev
```

## License

Licensed under the [MIT license](LICENSE).
