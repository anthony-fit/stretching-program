const { execSync } = require('child_process');

function run(cmd) {
  try {
    console.log(`> ${cmd}`);
    console.log(execSync(cmd, { encoding: 'utf8' }));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.stdout) console.log(`stdout: ${err.stdout}`);
    if (err.stderr) console.error(`stderr: ${err.stderr}`);
  }
}

run('git remote -v');
run('git status');
run('git log -1');
