# Beefy Vaults Subgraph

Subgraph to track beefy.finance vaults metrics

## Setup

- Copy `.envrc.example` to `.envrc`.
- Set `ACCESS_TOKEN` to your The Graph [access token](https://thegraph.com/docs/deploy-a-subgraph#store-the-access-token).
- Set `GRAPH_PATH` to `<github-username>/<subgraph-name>`.
- Export `.envrc` variables.

## Running

It is assumed that you have installed the graph-cli to run the following set of npm / yarn scripts.

### Scripts

- `yarn` – install dependencies
- `yarn build` - compile subgraph
- `yarn codegen` – generate code
- `yarn create` – allocate subgraph name in Graph Node
- `yarn deploy` - deploy supgraph to Graph Node
- `yarn publish-graph` – run all steps in one command
