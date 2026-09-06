import { ContactMessageService } from "@/app/lib/services/contactMessageService";
import MarkMessageReadButton from "@/app/components/admin/MarkMessageReadButton";
import StatusBadge from "@/app/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminContactMessagesPage() {
  const messages = await ContactMessageService.getAll();

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>
        Contact Messages
      </h1>

      <p style={{ color: "#666", marginBottom: 30 }}>
        Total : {messages.length}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m: any) => (
          <div
            key={m.id}
            style={{
              background: "#fff",
              border: "1px solid #ececec",
              borderRadius: 12,
              padding: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div>
                <strong>{m.name}</strong>{" "}
                <span style={{ color: "#888", fontSize: 13 }}>
                  ({m.email})
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <StatusBadge status={m.is_read ? "ACTIVE" : "PENDING"} />
                {!m.is_read && <MarkMessageReadButton id={m.id} />}
              </div>
            </div>

            <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#444" }}>
              {m.message}
            </p>

            <p style={{ marginTop: 10, marginBottom: 0, fontSize: 12, color: "#999" }}>
              {new Date(m.created_at).toLocaleString("en-IN")}
            </p>
          </div>
        ))}

        {messages.length === 0 && (
          <p style={{ color: "#999" }}>No messages yet.</p>
        )}
      </div>
    </div>
  );
}
