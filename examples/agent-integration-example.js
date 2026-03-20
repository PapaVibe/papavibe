const fs = require('fs');
const path = require('path');

async function run() {
  const payloadPath = process.argv[2] || './examples/review-request.good.json';
  const absolutePath = path.resolve(payloadPath);
  const payload = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

  const review = await fetch('http://127.0.0.1:8787/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(async (response) => {
    const body = await response.json();
    return { status: response.status, body };
  });

  console.log('Payload:', absolutePath);
  console.log('HTTP status:', review.status);
  console.log('Response:', JSON.stringify(review.body, null, 2));

  if (review.body.error) {
    console.log('Fix payload and retry. Do not execute blindly.');
    return;
  }

  if (review.body.verdict === 'approve') {
    console.log('Execute action');
    return;
  }

  if (review.body.verdict === 'manual_review') {
    console.log('Pause and ask human');
    return;
  }

  console.log('Abort execution');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
