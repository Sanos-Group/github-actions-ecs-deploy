const core = require('@actions/core');
const github = require('@actions/github');
const { ECS } = require('aws-sdk');

const path = require('path');
const fs = require('fs');

const ecs = new ECS({ region: 'eu-central-1' });

async function deployToECS() {

	// read input params
	const environment = core.getInput('environment', { required: true });
	const version = core.getInput('version', { required: true });
	const clusterName = core.getInput('clusterName', { required: true });
	const serviceName = core.getInput('serviceName', { required: true });
	const desiredCount = core.getInput('desiredCount');
	const ecrRegistry = core.getInput('ecrRegistry', { required: true });
	const taskDefinitionPath = core.getInput('taskDefinitionPath', { required: true });

	// check if taskdefinition build script is available
	const taskDefPath = path.resolve(taskDefinitionPath);
	console.log(`taskdefinition path: ${taskDefPath}`);
	if (!fs.existsSync(taskDefPath)) {
		throw new Error('No "taskdefinition.js" file found in project root');
	}

	// build and push docker image
	const ecrRepo = `${ecrRegistry}:${imageName}`;

	await exec.exec(`docker build -t ${serviceName} .`);
	await exec.exec(`docker tag ${serviceName}:latest ${ecrRepo}:${version}`);
	await exec.exec(`docker push ${ecrRepo}:${version}`);

	// build and register new taskdefinition
	const taskDefFunc = require(taskDefPath);
	const args = taskDefFunc(environment, version);
	const { taskDefinition } = await ecs.registerTaskDefinition(args)
		.promise();
	//console.log(JSON.stringify(taskDefinition, undefined, 2));
	const taskdefinitionId = `${taskDefinition.family}:${taskDefinition.revision}`;

	// deploy service
	const updateParams = {
		'cluster': clusterName,
		'service': serviceName,
		'taskDefinition': taskdefinitionId,
		'forceNewDeployment': true,
		'desiredCount': desiredCount,
	};

	const response = await ecs.updateService(updateParams)
		.promise();
	console.log(JSON.stringify(response));
};

try {
	deployToECS();
} catch (error) {
	core.setFailed(error.message);
}