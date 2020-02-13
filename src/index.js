#!/usr/bin/env node

const util = require('util')
const {exec} = require('child_process')
const chalk = require('chalk')

/**
 * Log success message
 * @param {string} message
 * @returns {Function} function
 */
function reportSuccess(message) {
  return result => {
    process.stdout.write(chalk.green(' ✓'))
    console.log(chalk.green(` ${message}`))
    return result
  }
}

/**
 * Log error message
 * @param {string} reason
 * @returns {Function} function
 */
function reportErrors(reason) {
  process.stdout.write(chalk.red(' ✘'))
  console.error(chalk.red(` ${reason}`))
  process.exit(1)
}

/**
 * Ask user if he wants to lint and prettify staged changes.
 * @returns {Promise<boolean>}
 */
function promptUser() {
  return new Promise(resolve => {
    process.stdout.write(
      chalk.bold.greenBright('Do you want to run Eslint? [Y/n] '),
    )
    process.stdin.resume()
    process.stdin.on('data', pData => {
      const answer =
        pData
          .toString()
          .trim()
          .toLowerCase() || 'y'
      answer === 'y' ? resolve(true) : resolve(false)
    })
  })
}

/**
 * Allow adding otherwise ignored files
 * @returns {Promise<string>}
 */
function runGitAddForce() {
  return new Promise((resolve, reject) => {
    exec(
      `git add tests --force`,
      {
        silent: false,
      },
      (code, error) => {
        if (code) {
          reject(new Error(error))
        } else {
          resolve()
        }
      },
    )
  })
}

/**
 * Run Eslint on staged files
 * @returns {Promise<string>}
 */
function lintStagedFiles() {
  return new Promise((resolve, reject) => {
    exec(
      'npm run lint:eslint:fix',
      {
        silent: true,
      },
      (code, error) => {
        if (code) {
          reject(new Error(error))
        } else {
          resolve()
        }
      },
    )
  })
}

/**
 * Run Eslint on staged files
 * @returns {Promise<string>}
 */
function runPrettier() {
  return new Promise((resolve, reject) => {
    exec(
      'npm run prettify',
      {
        silent: true,
      },
      (code, error) => {
        if (code) {
          reject(new Error(error))
        } else {
          resolve()
        }
      },
    )
  })
}

/**
 * Run the cli on the pre-commit hook
 */
;(async () => {
  const answer = await promptUser()
  if (answer === true) {
    const result = await lintStagedFiles()
      .then(reportSuccess('[1] Eslint passed'))
      .catch(reason => reportErrors(reason))
    await runPrettier()
      .then(reportSuccess('[2] Prettier completed'))
      .catch(reason => reportErrors(reason))
  } else {
    await runPrettier()
      .then(reportSuccess('[1] Prettier completed'))
      .catch(reason => reportErrors(reason))
  }
  await runGitAddForce()
  process.stdout.write(chalk.bold.cyanBright('\nDone!\n'))
  process.exit(0)
})()
