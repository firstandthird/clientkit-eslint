'use strict';
const formatter = require('eslint').CLIEngine.getFormatter();
const CLIEngine = require('eslint').CLIEngine;
const TaskKitTask = require('taskkit-task');
const path = require('path');

class EslintTask extends TaskKitTask {
  get defaultOptions() {
    return {
      ignore: ['.git', 'node_modules'],
      crashOnError: false
    };
  }
  // returns the module to load when running in a separate process:
  get classModule() {
    return path.join(__dirname, 'eslint.js');
  }

  get description() {
    return 'Runs the indicated eslint config against the files you listed, and reports the results ';
  }

  process(done) {
    if (!this.options.files) {
      return done();
    }
    const cli = new CLIEngine({
      ignorePattern: this.options.ignore
    });

    this.log(`Linting ${this.options.files} | Ignoring ${this.options.ignore}`);

    const results = cli.executeOnFiles(this.options.files).results;
    let hasError = false;

    results.forEach((result) => {
      if (result.errorCount > 0) {
        this.log(['error'], formatter(results));
        hasError = true;
      } else if (result.warningCount > 0) {
        this.log(['warning'], formatter(results));
      }
    });

    if (hasError && this.options.crashOnError) {
      throw new Error('Aborting due to eslint errors (turn off crashOnError if you want to run anyway)');
    }
  }
}
module.exports = EslintTask;
