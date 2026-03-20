const integrationSnippet = `const review = await fetch("http://127.0.0.1:8787/review", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task, proposedAction, context })
}).then((r) => r.json());

if (review.verdict === "approve") {
  // execute transaction
} else if (review.verdict === "manual_review") {
  // pause and ask a human
} else {
  // abort execution
}`;

const requestSnippet = `{
  "task": {
    "intent": "Stake 1000 USDC into approved protocol X",
    "allowedActionTypes": ["approve", "contract_interaction"],
    "allowedTargets": ["protocol-x-router", "protocol-x-vault"],
    "policy": {
      "allowUnlimitedApproval": false,
      "requireKnownTarget": true
    },
    "amount": { "token": "USDC", "value": "1000" }
  },
  "proposedAction": {
    "type": "approve",
    "token": "USDC",
    "amount": "MAX_UINT256",
    "target": "contract-y"
  },
  "context": {
    "agentId": "demo-agent-1",
    "sessionId": "demo-session-1"
  }
}`;

const curlSnippet = `curl -X POST http://127.0.0.1:8787/review \\
  -H "Content-Type: application/json" \\
  --data @examples/review-request.good.json`;

export function App() {
  return (
    <main className="page">
      <section className="hero shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">PapaVibe</p>
            <h1>Trust review before an AI agent moves money</h1>
            <p className="lead">
              PapaVibe is trust middleware for agent-controlled funds. Before an agent executes a
              money-related action, it sends the assigned task and the proposed action to PapaVibe.
              PapaVibe returns a verdict before execution: approve, manual review, or block.
            </p>
            <div className="hero-points">
              <span>Shows the trust decision before execution</span>
              <span>Demonstrates real guardrails judges can understand</span>
              <span>Gives other agents a copy-paste integration path</span>
            </div>
            <div className="actions">
              <a className="button primary" href="https://github.com/PapaVibe/papavibe" target="_blank" rel="noreferrer">View GitHub</a>
              <a className="button" href="https://github.com/PapaVibe/papavibe/blob/main/docs/submission-assets.md" target="_blank" rel="noreferrer">See Submission Assets</a>
              <a className="button" href="#integrate">Integrate PapaVibe</a>
            </div>
          </div>

          <div className="hero-panel card glass">
            <p className="panel-title">Execution loop</p>
            <div className="flow-line flow-stack">
              <span>Task assigned</span>
              <span className="arrow">→</span>
              <span>Agent proposes action</span>
              <span className="arrow">→</span>
              <span>PapaVibe reviews trust</span>
              <span className="arrow">→</span>
              <span>Execute / Pause / Abort</span>
            </div>
            <ul className="compact-list">
              <li>Checks whether the action still matches the original task</li>
              <li>Checks whether the action is too risky or too broad</li>
              <li>Checks whether the target is trusted for that action and token</li>
            </ul>
            <div className="hero-callout">
              <strong>Hero scenario:</strong> an agent is told to stake 1000 USDC, but tries an unlimited
              approval to an unfamiliar contract. PapaVibe blocks it before funds are exposed.
            </div>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card section-card">
          <p className="eyebrow">What it is</p>
          <h2>A trust gate, not a wallet</h2>
          <p>
            PapaVibe does not hold funds or replace execution. It sits between an agent’s planned
            money movement and the final transaction, then decides whether that action should proceed.
          </p>
        </article>

        <article className="card section-card">
          <p className="eyebrow">Why it matters</p>
          <h2>Agents can drift from the task they were given</h2>
          <p>
            Judges and product owners do not need to inspect calldata to understand the problem:
            an autonomous agent can receive a reasonable task and still choose a dangerous execution path.
            PapaVibe catches that drift before execution.
          </p>
        </article>
      </section>

      <section className="card section-card wide-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Three trust checks</p>
            <h2>What PapaVibe actually reviews</h2>
          </div>
        </div>
        <div className="grid three">
          <div className="mini-card">
            <h3>Task alignment</h3>
            <p>Does the proposed action still match the task the agent was assigned?</p>
          </div>
          <div className="mini-card">
            <h3>Execution risk</h3>
            <p>Is the action too broad, too large, malformed, or outside policy bounds?</p>
          </div>
          <div className="mini-card">
            <h3>Counterparty trust</h3>
            <p>Is the destination trusted for this token, this action type, and this economic intent?</p>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card section-card dark-card">
          <p className="eyebrow">Verdicts</p>
          <h2>Three simple outcomes another agent can act on immediately</h2>
          <div className="badge-stack">
            <div className="verdict-card approve">
              <span className="badge success">APPROVE</span>
              <p>Action fits the task and can proceed.</p>
            </div>
            <div className="verdict-card review">
              <span className="badge warning">MANUAL REVIEW</span>
              <p>Pause the flow and ask a human to confirm.</p>
            </div>
            <div className="verdict-card block">
              <span className="badge danger">BLOCK</span>
              <p>Do not execute the action.</p>
            </div>
          </div>
        </article>

        <article className="card section-card">
          <p className="eyebrow">Scenarios checked in the MVP</p>
          <h2>Focused, hackathon-disciplined coverage</h2>
          <ul className="clean-list">
            <li>Unlimited approval when the task requires bounded approval</li>
            <li>Action type mismatch, like approve vs transfer</li>
            <li>Amount higher than the task allows</li>
            <li>Unknown or untrusted target profiles</li>
            <li>Wrong token or wrong target category for the task intent</li>
            <li>Malformed requests rejected at the API boundary</li>
          </ul>
        </article>
      </section>

      <section id="integrate" className="card section-card wide-card integrate-card">
        <div className="section-head split-head">
          <div>
            <p className="eyebrow">Integrate PapaVibe</p>
            <h2>Copy-paste path for another AI agent</h2>
            <p className="section-copy">
              If your agent already knows how to build a proposed action, integration is one extra step:
              call <code>/review</code> before execution and obey the verdict.
            </p>
          </div>
          <div className="stack-links">
            <a className="button primary small" href="https://github.com/PapaVibe/papavibe/blob/main/docs/integration.md" target="_blank" rel="noreferrer">Open integration guide</a>
            <a className="button small" href="https://github.com/PapaVibe/papavibe/blob/main/examples/review-from-stdin.js" target="_blank" rel="noreferrer">Use stdin example</a>
          </div>
        </div>

        <div className="grid two code-grid">
          <div>
            <p className="mini-label">1. Send task + proposed action</p>
            <pre>{requestSnippet}</pre>
          </div>
          <div>
            <p className="mini-label">2. Gate execution on the verdict</p>
            <pre>{integrationSnippet}</pre>
          </div>
        </div>

        <div className="grid two">
          <div className="mini-card">
            <h3>Fast local call</h3>
            <pre>{curlSnippet}</pre>
          </div>
          <div className="mini-card">
            <h3>Zero-friction path</h3>
            <ul className="clean-list tight-list">
              <li><code>GET /status</code> to confirm the service is alive</li>
              <li><code>GET /contract</code> to inspect the request/response shape</li>
              <li><code>POST /review</code> before every money-related action</li>
              <li>Execute, pause, or abort based on the returned verdict</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card section-card">
          <p className="eyebrow">Judge path</p>
          <h2>One coherent demo story</h2>
          <ul className="clean-list">
            <li>Show the host agent receiving a task and proposing an action</li>
            <li>Show PapaVibe returning approve, manual review, and block</li>
            <li>Then show malformed payload rejection in the browser or boundary check</li>
            <li>Close on the claim: trust is the execution gate, not a warning after the fact</li>
          </ul>
        </article>

        <article className="card section-card">
          <p className="eyebrow">Docs</p>
          <h2>Start in the right place</h2>
          <div className="link-stack">
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/submission-assets.md" target="_blank" rel="noreferrer">Submission assets: summary, pitch, and framing</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/README.md" target="_blank" rel="noreferrer">README: product story + adoption path</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/quickstart.md" target="_blank" rel="noreferrer">Quickstart: shortest local path</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/demo.md" target="_blank" rel="noreferrer">Demo: judge-friendly walkthrough</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/mvp-scope.md" target="_blank" rel="noreferrer">MVP scope: disciplined hackathon framing</a>
          </div>
        </article>
      </section>
    </main>
  );
}
