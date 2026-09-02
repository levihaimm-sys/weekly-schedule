import { getClientPortalData } from "@/lib/queries/schedule";
import { PortalScheduleTable } from "@/components/client-portal/portal-schedule-table";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getClientPortalData(token);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-6">
        <p className="text-lg font-semibold text-muted-foreground">
          קישור לא תקין
        </p>
      </div>
    );
  }

  const { client, lessons } = data;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-5xl space-y-5 p-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">לוח שיעורים</p>
          <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
            <p className="text-base font-medium text-muted-foreground">
              אין שיעורים עתידיים מתוכננים כרגע
            </p>
          </div>
        ) : (
          <PortalScheduleTable lessons={lessons as any} token={token} />
        )}
      </div>
    </div>
  );
}
