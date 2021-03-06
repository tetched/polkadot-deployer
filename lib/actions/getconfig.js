const chalk = require('chalk');
const process = require('process');

const { Cluster } = require('../cluster');
const { Files } = require('../core/files');
const init = require('../init');
const inquirer = require('./inquirer');
const { Validation } = require('../validation');


module.exports = {
  do: async (cmd) => {
    const files = new Files();

    let config;
    if (cmd.config) {
      config = files.readJSON(cmd.config);
      const validator = new Validation();
      if (!validator.run(config)) {
        process.exit(1);
      }
    } else {
      config = await inquirer.getConfig();
    }

    if (config.type === 'local') {
      console.log(chalk.red('getConfig action only works for remote deployments'));
      process.exit(1);
    }

    config.verbose = cmd.verbose;
    config.dataPath = cmd.data;

    await init.ensure(config);

    await getConfig(config);
  }
}

async function getConfig(config) {
  console.log(chalk.yellow(`Getting configuration from deployment '${config.name}'...`));
  const cluster = new Cluster(config);

  try {
    await cluster.getConfig();
  } catch (err) {
    console.error(`Could not get configuration: ${err.message}`);
    process.exit(1);
  }
  console.log(chalk.green('Done'));
}
