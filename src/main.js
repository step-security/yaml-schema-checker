const core = require("@actions/core");

const FileUtils = require("./utils/file-utils");
const StringUtils = require("./utils/string-utils");
const SchemaUtils = require("./utils/schema-utils");
const ActionUtils = require("./utils/action-utils");
const ArrayUtils = require("./utils/array-utils");
const axios = require("axios");
const fs = require("fs");

async function validateSubscription() {
    let repoPrivate;
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (eventPath && fs.existsSync(eventPath)) {
        const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
        repoPrivate = payload?.repository?.private;
    }

    const upstream = "thiagodnf/yaml-schema-checker";
    const action = process.env.GITHUB_ACTION_REPOSITORY;
    const docsUrl = "https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions";
    core.info("");
    core.info("\u001b[1;36mStepSecurity Maintained Action\u001b[0m");
    core.info(`Secure drop-in replacement for ${upstream}`);
    if (repoPrivate === false) core.info("\u001b[32m\u2713 Free for public repositories\u001b[0m");
    core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
    core.info("");
    if (repoPrivate === false) return;
    const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
    const body = { action: action || "" };
    if (serverUrl !== "https://github.com") body.ghes_server = serverUrl;
    try {
        await axios.post(
            `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
            body, { timeout: 3000 }
        );
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
            core.error("\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m");
            core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
            process.exit(1);
        }
        core.info("Timeout or API not reachable. Continuing to next step.");
    }
}


async function run() {

    try {
        await validateSubscription();
        if (FileUtils.isWorkspaceEmpty()) {
            throw new Error("Workspace is empty. Did you forget to run \"actions/checkout\" before running this Github Action?");
        }

        const inputJsonSchemaFile = ActionUtils.getInput("jsonSchemaFile", { required: true });
        const inputYamlFiles = ActionUtils.getInputAsArray("yamlFiles", { required: true });
        const inputFilesSeparator = ActionUtils.getInput("filesSeparator", { required: false });

        if (StringUtils.isBlank(inputJsonSchemaFile)) {
            throw new Error("The 'jsonSchemaFile' parameter should not be blank");
        }

        if (!FileUtils.exists(inputJsonSchemaFile)) {
            throw new Error(`${inputJsonSchemaFile} could not be found in workspace`);
        }

        if (StringUtils.isBlank(inputYamlFiles)) {
            throw new Error("The 'yamlFiles' parameter should not be blank");
        }

        const yamlFiles = ArrayUtils.split(inputYamlFiles, inputFilesSeparator);

        const schemaContentAsJson = FileUtils.getContentFromJson(inputJsonSchemaFile);

        const files = FileUtils.loadFiles(yamlFiles);

        core.info(`Found ${files.size} file(s). Checking them:`);

        let validFiles = [];
        let invalidFiles = [];

        files.forEach(file => {

            core.debug(`Processing: ${file}`);

            const yamlContentAsJson = FileUtils.getContentFromYaml(file);

            const result = SchemaUtils.validate(schemaContentAsJson, yamlContentAsJson);

            if (result.errors.length === 0) {
                core.info(`✅ ${file}`);

                validFiles.push(file);
            } else {
                core.info(`❌ ${file}`);

                invalidFiles.push(file);

                result.errors.forEach(error => {
                    core.info(`    - ${error.stack}`);
                });
            }
        });

        core.info("Done. All files checked");

        core.setOutput("validFiles", validFiles.join(","));
        core.setOutput("invalidFiles", invalidFiles.join(","));

        if (invalidFiles.length !== 0) {
            throw new Error(`It was found ${invalidFiles.length} invalid file(s)`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
