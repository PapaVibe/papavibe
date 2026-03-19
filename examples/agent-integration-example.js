const fs = require('fs');

async function run() {
  const payload = JSON.parse(
    fs.readFileSync('./examples/review-request.bad.json', 'utf8')
  );

  const review = await fetch('http://127.0.0.1:8787/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

  console.log('PapaVibe verdict:', review.verdict);
  console.log('Reason:', review.summary);

  if (review.verdict === 'approve') {
    console.log('Execute action');
    return;
  }

  if (review.verdict === 'manual_review') {
    console.log('Pause and ask human');
    return;
  }

  console.log('Abort execution');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
