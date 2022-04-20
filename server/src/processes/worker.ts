// NOTE: This file is needed to act as a middle man for ts-node
// DO NOT DELETE

const { workerData } = require('worker_threads');

require('ts-node').register();
require(workerData.aliasModule);