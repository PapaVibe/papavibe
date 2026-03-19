let input = "";

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', async () => {
  try {
    const payload = JSON.parse(input);
    const review = await fetch('http://127.0.0.1:8787/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json());

    console.log(JSON.stringify(review, null, 2));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
