// test-imports.js
import * as zkConfig from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import * as proofProvider from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import * as types from '@midnight-ntwrk/midnight-js-types';
import * as utils from '@midnight-ntwrk/midnight-js-utils';

try {
  console.log('✅ All imports successful');
  console.log('ZkConfig exports:', Object.keys(zkConfig));
  console.log('ProofProvider exports:', Object.keys(proofProvider));
  console.log('Types available:', Object.keys(types).length);
  console.log('Utils available:', Object.keys(utils).length);
} catch (error) {
  console.error('❌ Import failed:', error.message);
}