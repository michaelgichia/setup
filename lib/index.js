"use strict";

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.trim");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var util = require('util');

var {
  exec
} = require('child_process');

var chalk = require('chalk');
/**
 * Log success message
 * @param {string} message
 * @returns {Function} function
 */


function reportSuccess(message) {
  return result => {
    process.stdout.write(chalk.green(' ✓'));
    console.log(chalk.green(" ".concat(message)));
    return result;
  };
}
/**
 * Log error message
 * @param {string} reason
 * @returns {Function} function
 */


function reportErrors(reason) {
  process.stdout.write(chalk.red(' ✘'));
  console.error(chalk.red(" ".concat(reason)));
  process.exit(1);
}
/**
 * Ask user if he wants to lint and prettify staged changes.
 * @returns {Promise<boolean>}
 */


function promptUser() {
  return new Promise(resolve => {
    process.stdout.write(chalk.bold.greenBright('Do you want to run Eslint? [Y/n] '));
    process.stdin.resume();
    process.stdin.on('data', pData => {
      var answer = pData.toString().trim().toLowerCase() || 'y';
      answer === 'y' ? resolve(true) : resolve(false);
    });
  });
}
/**
 * Allow adding otherwise ignored files
 * @returns {Promise<string>}
 */


function runGitAddForce() {
  return new Promise((resolve, reject) => {
    exec("git add {files} --force", {
      silent: true
    }, (code, error) => {
      if (code) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}
/**
 * Run Eslint on staged files
 * @returns {Promise<string>}
 */


function lintStagedFiles() {
  return new Promise((resolve, reject) => {
    exec('npm run lint:eslint:fix', {
      silent: true
    }, (code, error) => {
      if (code) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}
/**
 * Run Eslint on staged files
 * @returns {Promise<string>}
 */


function runPrettier() {
  return new Promise((resolve, reject) => {
    exec('npm run prettify', {
      silent: true
    }, (code, error) => {
      if (code) {
        reject(new Error(error));
      } else {
        resolve();
      }
    });
  });
}
/**
 * Run the cli on the pre-commit hook
 */


;

_asyncToGenerator(function* () {
  var answer = yield promptUser();

  if (answer === true) {
    var result = yield lintStagedFiles().then(reportSuccess('[1] Eslint passed')).catch(reason => reportErrors(reason));
    yield runPrettier().then(reportSuccess('[2] Prettier completed')).catch(reason => reportErrors(reason));
  } else {
    yield runPrettier().then(reportSuccess('[1] Prettier completed')).catch(reason => reportErrors(reason));
  }

  yield runGitAddForce();
  process.stdout.write(chalk.bold.cyanBright('\nDone!\n'));
  process.exit(0);
})();