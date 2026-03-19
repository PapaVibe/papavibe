export function App() {
  return (
    <main className="page">
      <section className="hero shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">PapaVibe</p>
            <h1>Trust gate for agent-controlled funds</h1>
            <p className="lead">
              PapaVibe reviews risky onchain actions before an agent is allowed to execute them.
            </p>
            <div className="actions">
              <a className="button primary" href="https://github.com/PapaVibe/papavibe" target="_blank" rel="noreferrer">View GitHub</a>
              <a className="button" href="https://github.com/PapaVibe/papavibe/blob/main/docs/mvp-ready.md" target="_blank" rel="noreferrer">Try Demo</a>
              <a className="button" href="https://github.com/PapaVibe/papavibe/blob/main/docs/integration.md" target="_blank" rel="noreferrer">Integration Guide</a>
            </div>
          </div>

          <div className="hero-panel card glass">
            <p className="panel-title">Execution flow</p>
            <div className="flow-line">
              <span>Agent</span>
              <span className="arrow">→</span>
              <span>PapaVibe</span>
              <span className="arrow">→</span>
              <span>Execute / Pause / Abort</span>
            </div>
            <ul className="compact-list">
              <li>Checks task alignment</li>
              <li>Checks action risk</li>
              <li>Checks target trust</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card section-card">
          <p className="eyebrow">Problem</p>
          <h2>Agents can move money before anyone catches drift</h2>
          <p>
            PapaVibe sits before execution and decides whether the proposed action is safe enough to continue.
          </p>
        </article>

        <article className="card section-card">
          <p className="eyebrow">Verdicts</p>
          <h2>Three simple outcomes</h2>
          <div className="badge-stack">
            <div className="verdict-card approve">
              <span className="badge success">APPROVE</span>
              <p>Execute the action.</p>
            </div>
            <div className="verdict-card review">
              <span className="badge warning">MANUAL REVIEW</span>
              <p>Pause and ask a human.</p>
            </div>
            <div className="verdict-card block">
              <span className="badge danger">BLOCK</span>
              <p>Do not execute the action.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="card section-card wide-card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Core checks</p>
            <h2>What PapaVibe checks</h2>
          </div>
        </div>
        <div className="grid three">
          <div className="mini-card">
            <h3>Task alignment</h3>
            <p>Does the proposed action match the assigned task?</p>
          </div>
          <div className="mini-card">
            <h3>Action risk</h3>
            <p>Is the action itself too broad, unsafe, or out of bounds?</p>
          </div>
          <div className="mini-card">
            <h3>Target trust</h3>
            <p>Is the destination allowed, expected, and safe enough?</p>
          </div>
        </div>
      </section>

      <section className="grid two">
        <article className="card section-card dark-card">
          <p className="eyebrow">Integration</p>
          <h2>How it fits into an agent</h2>
          <div className="steps-grid">
            <div className="step-card"><span>1</span><p>Agent receives a task</p></div>
            <div className="step-card"><span>2</span><p>Agent prepares an action</p></div>
            <div className="step-card"><span>3</span><p>Agent calls PapaVibe</p></div>
            <div className="step-card"><span>4</span><p>PapaVibe returns a verdict</p></div>
          </div>
        </article>

        <article className="card section-card">
          <p className="eyebrow">Minimal contract</p>
          <h2>Request shape</h2>
          <pre>{`{
  "task": { ... },
  "proposedAction": { ... },
  "context": { ... }
}`}</pre>
          <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/integration.md" target="_blank" rel="noreferrer">View full contract</a>
        </article>
      </section>

      <section className="grid two">
        <article className="card section-card">
          <p className="eyebrow">Demo</p>
          <h2>Try the product quickly</h2>
          <ul className="clean-list">
            <li>Browser demo with bad / good / manual review scenarios</li>
            <li>Host-agent demo with execute / pause / abort outcomes</li>
            <li>Service inspect for status, contract, and endpoints</li>
          </ul>
        </article>

        <article className="card section-card">
          <p className="eyebrow">Quickstart</p>
          <h2>Shortest path</h2>
          <ul className="clean-list">
            <li>Start backend</li>
            <li>Start frontend</li>
            <li>Inspect service</li>
            <li>Run check and demo</li>
          </ul>
          <div className="link-stack">
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/quickstart.md" target="_blank" rel="noreferrer">Open Quickstart</a>
            <a className="text-link" href="https://github.com/PapaVibe/papavibe/blob/main/docs/mvp-ready.md" target="_blank" rel="noreferrer">Open MVP Ready</a>
          </div>
        </article>
      </section>
    </main>
  );
}
