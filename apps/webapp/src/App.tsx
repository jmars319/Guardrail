import { appMetadata } from "@guardrail/config";
import { guardrailStatement } from "@guardrail/ui";

export default function App() {
  return (
    <main className="web-shell">
      <section className="web-card">
        <p className="eyebrow">Web channel</p>
        <h1>{appMetadata.name}</h1>
        <p className="lead">
          tenra Guardrail is desktop-first. The web channel is reserved for remote visibility and secondary review flows.
        </p>
        <p>{guardrailStatement}</p>
      </section>

      <section className="web-grid">
        <article className="web-panel">
          <h2>Current Focus</h2>
          <p>
            The local desktop runtime is the primary surface because policy,
            approvals, filesystem boundaries, and Tool Host enforcement belong
            close to the machine doing the work.
          </p>
        </article>

        <article className="web-panel">
          <h2>What Comes Later</h2>
          <p>
            Web workflows can add remote visibility while preserving the local-first runtime model.
          </p>
        </article>
      </section>
    </main>
  );
}
