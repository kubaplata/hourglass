const path = require('path');
const programDir = path.join(__dirname, 'programs/hourglass-protocol');
const idlDir = path.join(__dirname, 'target/idl');
const sdkDir = path.join(__dirname, '/sdk/src/generated');
const binaryInstallDir = path.join(__dirname, '.crates');

module.exports = {
  idlGenerator: 'anchor',
  programName: 'hourglass_protocol',
  programId: '83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij',
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};