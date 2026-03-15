import { appMetadata } from "@guardrail/config";
import { guardrailStatement } from "@guardrail/ui";

export default function App() {
  return (
    <main className="web-shell">
      <section className="web-card">
        <p className="eyebrow">Future Surface</p>
        <h1>{appMetadata.name}</h1>
        <p className="lead">
          Guardrail is desktop-first. This web app is a placeholder for future
          activation, not an active product surface.
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
            A web surface may eventually provide remote visibility or secondary
            workflows, but it should not weaken the local-first runtime model.
          </p>
        </article>
      </section>
    </main>
  );
}
