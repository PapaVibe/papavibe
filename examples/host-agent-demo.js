const fs = require('fs');

async function run(fileName) {
  const payload = JSON.parse(fs.readFileSync(fileName, 'utf8'));

  console.log('Task:', payload.task.intent);
  console.log('Proposed action:', payload.proposedAction.rawDescription);
  console.log('Sending to PapaVibe for review...');

  const review = await fetch('http://127.0.0.1:8787/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

  console.log('Verdict:', review.verdict);
  console.log('Reason:', review.summary);

  if (review.verdict === 'approve') {
    console.log('Host agent decision: execute action');
    return;
  }

  if (review.verdict === 'manual_review') {
    console.log('Host agent decision: pause and ask human');
    return;
  }

  console.log('Host agent decision: abort execution');
}

const fileName = process.argv[2] || './examples/review-request.bad.json';
run(fileName).catch((error) => {
  console.error(error);
  process.exit(1);
});
