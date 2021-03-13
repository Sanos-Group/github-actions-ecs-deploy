# Github Actions ECS deploy

Builds the ECR docker image and deploys dockerized service to ECS (Fargate).

## Inputs

### `environment`

**Required** The environment to deploy to. (e.g. dev / beta / prod).

### `version`

**Required** The docker image version e.g. "1.0.1"

### `clusterName`

**Required**  The ECS cluster name to deploy the service to

### `serviceName`

**Required**  The name of the service to deploy

### `desiredCount`

**Optional** Number of tasks to start. Defaults to 1

### `ecrRegistry`

**Required** Name of the ECR registry

### `taskDefinitionPath`

**Required** Relative path of task definition js file. Defaults to "taskdefinition.js"

### `imageName`

**Required** Name of the docker image