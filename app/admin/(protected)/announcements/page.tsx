import { AnnouncementService } from "@/app/lib/services/announcementService";
import AddAnnouncementForm from "@/app/components/admin/AddAnnouncementForm";
import AnnouncementRowActions from "@/app/components/admin/AnnouncementRowActions";
import StatusBadge from "@/app/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await AnnouncementService.getAll();

  return (
    <div>
      <h1 style={{ marginTop: 0, marginBottom: 10 }}>
        Announcements
      </h1>

      <p style={{ color: "var(--color-text-secondary)", marginBottom: 30 }}>
        Shown as a flash bar at the top of every page on the site —
        upcoming books, offers, festival greetings, anything you want
        visitors to see immediately.
      </p>

      <AddAnnouncementForm />

      <div style={{ overflowX: "auto" }}>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "var(--color-white)",
          minWidth: 700,
        }}
      >
        <thead>
          <tr style={{ background: "var(--color-bg-subtle)" }}>
            <th align="left" style={{ padding: 14 }}>
              Message
            </th>

            <th align="left">Link</th>

            <th align="center">Status</th>

            <th align="left">Created</th>

            <th align="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {announcements.map((a: any) => (
            <tr key={a.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
              <td style={{ padding: 14, maxWidth: 320 }}>
                {a.message}
              </td>

              <td style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                {a.link || "—"}
              </td>

              <td align="center">
                <StatusBadge
                  status={a.is_active ? "ACTIVE" : "INACTIVE"}
                />
              </td>

              <td>
                {new Date(a.created_at).toLocaleDateString("en-IN")}
              </td>

              <td align="center">
                <AnnouncementRowActions
                  id={a.id}
                  isActive={a.is_active}
                />
              </td>
            </tr>
          ))}

          {announcements.length === 0 && (
            <tr>
              <td colSpan={5} align="center" style={{ padding: 30 }}>
                No announcements yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      </div>
    </div>
  );
}
