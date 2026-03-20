const integrationSnippet = `const review = await fetch("http://127.0.0.1:8787/review", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task, proposedAction, context })
}).then((r) => r.json());

if (review.verdict === "approve") execute();
if (review.verdict === "manual_review") askHuman();
if (review.verdict === "block") abort();`;

const requestSnippet = `{
  "task": "Stake 1000 USDC into protocol X",
  "proposedAction": "Approve MAX_UINT256 to contract Y",
  "policy": {
    "allowUnlimitedApproval": false,
    "requireKnownTarget": true
  }
}`;

const roadmap = [
  {
    label: 'Now',
    title: 'Trust review API',
    points: [
      'Task-action mismatch detection',
      'Risk checks for amount, target, and approval scope',
      'Simple verdicts: approve, manual review, block'
    ]
  },
  {
    label: 'Next',
    title: 'Deeper integrations',
    points: [
      'Browser and host-agent guardrails',
      'Stronger counterparty trust profiles',
      'Cleaner policy tooling for teams'
    ]
  },
  {
    label: 'Later',
    title: 'Trust layer for agent finance',
    points: [
      'Richer execution contexts and rules',
      'Broader ecosystem integrations',
      'Production-grade monitoring and controls'
    ]
  }
];

const steps = [
  {
    number: '01',
    title: 'Define the task',
    text: 'Your agent gets an intended action, limits, and approved targets.'
  },
  {
    number: '02',
    title: 'Review before execution',
    text: 'PapaVibe compares the proposed action against the task and policy.'
  },
  {
    number: '03',
    title: 'Act on the verdict',
    text: 'Execute, pause for review, or block before funds are exposed.'
  }
];

const benefits = [
  'Stops task drift before money moves',
  'Makes agent behavior easier to trust and explain',
  'Works as middleware instead of replacing your wallet stack',
  'Returns machine-readable verdicts your system can obey instantly'
];

export function App() {
  return (
    <main className="page">
      <section className="hero shell">
        <div className="hero-copy">
          <div className="hero-topline">
            <p className="eyebrow">PapaVibe</p>
            <span className="status-pill">Trust middleware for agent-controlled funds</span>
          </div>

          <h1>Review AI money actions before execution.</h1>
          <p className="lead">
            PapaVibe sits between an agent task and the transaction it wants to send. It checks whether
            the action still matches the task, fits policy, and looks safe enough to proceed.
          </p>

          <div className="hero-points">
            <span>Task → review → verdict → execution</span>
            <span>Built for agent-driven finance</span>
            <span>Simple API, clear trust decisions</span>
          </div>

          <div className="actions">
            <a className="button primary" href="#integrate">See integration</a>
            <a className="button" href="https://github.com/PapaVibe/papavibe" target="_blank" rel="noreferrer">View GitHub</a>
          </div>
        </div>

        <div className="hero-panel card">
          <div className="hero-panel-head">
            <p className="panel-title">Example review</p>
            <span className="badge danger subtle">BLOCK</span>
          </div>

          <div className="signal-card">
            <p className="signal-label">Task</p>
            <strong>Stake 1000 USDC into protocol X</strong>
          </div>

          <div className="signal-card flagged">
            <p className="signal-label">Proposed action</p>
            <strong>Unlimited approval to unfamiliar contract Y</strong>
          </div>

          <div className="hero-callout">
            PapaVibe catches the mismatch before execution, so the agent never reaches the risky step.
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-intro narrow">
          <p className="eyebrow">What PapaVibe does</p>
          <h2>A trust gate for AI-driven transactions.</h2>
          <p>
            PapaVibe is not a wallet and not an execution engine. It is the review layer that sits in
            front of money-related actions and returns a verdict your system can enforce.
          </p>
        </div>

        <div className="grid three">
          <article className="mini-card feature-card">
            <h3>Checks task alignment</h3>
            <p>Confirms the action still reflects the original user or system intent.</p>
          </article>
          <article className="mini-card feature-card">
            <h3>Checks execution risk</h3>
            <p>Flags broad approvals, oversized amounts, malformed requests, and policy breaks.</p>
          </article>
          <article className="mini-card feature-card">
            <h3>Checks counterparty trust</h3>
            <p>Looks at whether the destination is appropriate for that token, action, and task.</p>
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-intro">
          <p className="eyebrow">How it works</p>
          <h2>Simple enough to scan in seconds.</h2>
        </div>

        <div className="grid three steps-grid">
          {steps.map((step) => (
            <article key={step.number} className="card step-card">
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block split-section">
        <article className="card section-card emphasis-card">
          <p className="eyebrow">Benefits</p>
          <h2>Designed for teams shipping autonomous flows.</h2>
          <ul className="clean-list benefit-list">
            {benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article id="integrate" className="card section-card integrate-card">
          <p className="eyebrow">Integrate / API</p>
          <h2>Add one review call before execution.</h2>
          <p className="section-copy">
            If your agent can already prepare a proposed action, PapaVibe fits as a lightweight gate:
            send the task and action to <code>/review</code>, then obey the verdict.
          </p>

          <div className="grid two code-grid compact-code-grid">
            <div>
              <p className="mini-label">Request shape</p>
              <pre>{requestSnippet}</pre>
            </div>
            <div>
              <p className="mini-label">Execution gate</p>
              <pre>{integrationSnippet}</pre>
            </div>
          </div>

          <div className="inline-links">
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/integration.md" target="_blank" rel="noreferrer">Integration guide</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/quickstart.md" target="_blank" rel="noreferrer">Quickstart</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/examples/review-from-stdin.js" target="_blank" rel="noreferrer">Example script</a>
          </div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-intro">
          <p className="eyebrow">Roadmap</p>
          <h2>Clear progression from MVP to broader trust infrastructure.</h2>
        </div>

        <div className="grid three roadmap-grid">
          {roadmap.map((item) => (
            <article key={item.label} className="card roadmap-card">
              <span className="roadmap-label">{item.label}</span>
              <h3>{item.title}</h3>
              <ul className="clean-list tight-list">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="card cta-card">
        <div>
          <p className="eyebrow">Ready to use PapaVibe?</p>
          <h2>Add trust review where your agent decides to move money.</h2>
          <p>
            Start with the API, wire verdicts into your execution path, and give users a safer default.
          </p>
        </div>
        <div className="actions compact-actions">
          <a className="button primary" href="https://github.com/PapaVibe/papavibe" target="_blank" rel="noreferrer">Open repository</a>
          <a className="button" href="https://github.com/PapaVibe/papavibe/blob/main/docs/demo.md" target="_blank" rel="noreferrer">View demo flow</a>
        </div>
      </section>
    </main>
  );
}
