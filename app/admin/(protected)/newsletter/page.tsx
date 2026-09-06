import { NewsletterRepository } from "@/app/lib/repositories/newsletterRepository";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subscribers = await NewsletterRepository.getAllActive();

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>
        Newsletter Subscribers
      </h1>

      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 30,
        }}
      >
        Total : {subscribers.length}
      </p>

      <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--color-white)",
          minWidth: 400,
        }}
      >
        <thead>
          <tr style={{ background: "var(--color-bg-subtle)" }}>
            <th align="left" style={{ padding: 14 }}>
              Email
            </th>

            <th align="left">Subscribed</th>
          </tr>
        </thead>

        <tbody>
          {subscribers.map((s: any) => (
            <tr
              key={s.id}
              style={{
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <td style={{ padding: 14 }}>{s.email}</td>

              <td>
                {new Date(s.created_at).toLocaleDateString(
                  "en-IN"
                )}
              </td>
            </tr>
          ))}

          {subscribers.length === 0 && (
            <tr>
              <td
                colSpan={2}
                align="center"
                style={{ padding: 30 }}
              >
                No subscribers yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
