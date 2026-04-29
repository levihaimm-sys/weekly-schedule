"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  MapPin,
  LogIn,
  Check,
  Loader2,
  FileText,
  ScrollText,
  Link,
  MessageCircle,
  Smartphone,
  Upload,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  INSTRUCTOR_STATUS,
  CLIENTS,
  InstructorStatusType,
  EmploymentType,
} from "@/lib/utils/constants";
import {
  updateInstructor,
  updateInstructorStatus,
  updateInstructorOnboarding,
  uploadInstructorFile,
  syncInstructorAuthUsers,
} from "@/lib/actions/instructors";

export interface InstructorFull {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: InstructorStatusType;
  address: string | null;
  work_cities: string | null;
  rotation_order: number | null;
  employment_type: EmploymentType | null;
  clients: string[] | null;
  id_photo_url: string | null;
  contract_url: string | null;
  monthly_report_link: string | null;
  whatsapp_added: boolean | null;
}

interface Props {
  instructor: InstructorFull;
  lastLogin: string | null;
  hasAppAccess: boolean;
  onClose: () => void;
}

function formatLastLogin(dateStr: string | null | undefined): string {
  if (!dateStr) return "לא התחבר";
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "היום";
  if (diffDays === 1) return "אתמול";
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month}`;
}

export function InstructorDrawer({ instructor, lastLogin, hasAppAccess, onClose }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"details" | "onboarding">("details");
  const [isPending, startTransition] = useTransition();

  // Details tab state
  const [name, setName] = useState(instructor.full_name);
  const [phone, setPhone] = useState(instructor.phone ?? "");
  const [address, setAddress] = useState(instructor.address ?? "");
  const [workCities, setWorkCities] = useState(instructor.work_cities ?? "");
  const [rotationOrder, setRotationOrder] = useState(instructor.rotation_order?.toString() ?? "");
  const [status, setStatus] = useState<InstructorStatusType>(instructor.status);
  const [selectedClients, setSelectedClients] = useState<string[]>(instructor.clients ?? []);
  const [detailsSaved, setDetailsSaved] = useState(false);

  // Onboarding tab state
  const [reportLink, setReportLink] = useState(instructor.monthly_report_link ?? "");
  const [whatsapp, setWhatsapp] = useState(instructor.whatsapp_added ?? false);
  const [idPhotoUrl, setIdPhotoUrl] = useState(instructor.id_photo_url);
  const [contractUrl, setContractUrl] = useState(instructor.contract_url);
  const [onboardingSaved, setOnboardingSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const contractInputRef = useRef<HTMLInputElement>(null);

  function toggleClient(client: string) {
    setSelectedClients((prev) =>
      prev.includes(client) ? prev.filter((c) => c !== client) : [...prev, client]
    );
  }

  async function handleSaveDetails() {
    startTransition(async () => {
      const rotNum = rotationOrder.trim() ? parseInt(rotationOrder.trim(), 10) : null;
      await Promise.all([
        updateInstructor(instructor.id, {
          full_name: name.trim() || instructor.full_name,
          phone: phone.trim() || null,
          address: address.trim() || null,
          work_cities: workCities.trim() || null,
          rotation_order: isNaN(rotNum as number) ? null : rotNum,
        }),
        updateInstructorStatus(instructor.id, status),
        updateInstructorOnboarding(instructor.id, {
          clients: selectedClients,
        }),
      ]);
      setDetailsSaved(true);
      setTimeout(() => setDetailsSaved(false), 2000);
      router.refresh();
    });
  }

  async function handleSaveOnboarding() {
    startTransition(async () => {
      await updateInstructorOnboarding(instructor.id, {
        monthly_report_link: reportLink.trim() || null,
        whatsapp_added: whatsapp,
      });
      setOnboardingSaved(true);
      setTimeout(() => setOnboardingSaved(false), 2000);
      router.refresh();
    });
  }

  async function handleFileUpload(fileType: "id_photo" | "contract", file: File) {
    const setter = fileType === "id_photo" ? setUploadingPhoto : setUploadingContract;
    setter(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("instructorId", instructor.id);
    fd.append("fileType", fileType);
    fd.append("file", file);
    const result = await uploadInstructorFile(fd);
    setter(false);
    if (result.error) {
      setUploadError(result.error);
    } else if (result.url) {
      if (fileType === "id_photo") setIdPhotoUrl(result.url);
      else setContractUrl(result.url);
      router.refresh();
    }
  }

  async function handleSync() {
    setIsSyncing(true);
    await syncInstructorAuthUsers([instructor.id]);
    setIsSyncing(false);
    router.refresh();
  }

  const statusColors: Record<InstructorStatusType, string> = {
    active: "bg-green-100 text-green-700 border-green-200",
    substitute: "bg-blue-100 text-blue-700 border-blue-200",
    inactive: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const onboardingItems = [
    { key: "id_photo", done: !!idPhotoUrl },
    { key: "contract", done: !!contractUrl },
    { key: "report", done: !!reportLink },
    { key: "whatsapp", done: whatsapp },
    { key: "access", done: hasAppAccess },
  ];
  const doneCount = onboardingItems.filter((i) => i.done).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                status === "active"
                  ? "bg-green-100 text-green-700"
                  : status === "substitute"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {instructor.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{instructor.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {INSTRUCTOR_STATUS[status]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("details")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "details"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            פרטים אישיים
          </button>
          <button
            onClick={() => setTab("onboarding")}
            className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "onboarding"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            קליטה
            <span
              className={`mr-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                doneCount === 5
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {doneCount}/5
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ───── DETAILS TAB ───── */}
          {tab === "details" && (
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">שם מלא</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">טלפון</label>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0 text-muted-foreground" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    type="tel"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">כתובת מגורים</label>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="shrink-0 text-muted-foreground" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Work cities */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">ערים לעבודה</label>
                <input
                  value={workCities}
                  onChange={(e) => setWorkCities(e.target.value)}
                  placeholder="למשל: הוד השרון, כפר סבא"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Clients */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">לקוחות</label>
                <div className="flex flex-wrap gap-2">
                  {CLIENTS.map((client) => (
                    <button
                      key={client}
                      type="button"
                      onClick={() => toggleClient(client)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        selectedClients.includes(client)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {client}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-xs font-medium text-muted-foreground">סטטוס</label>
                <div className="flex gap-2">
                  {(Object.entries(INSTRUCTOR_STATUS) as [InstructorStatusType, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatus(key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        status === key
                          ? statusColors[key]
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation order */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  סדר בטבלת הקצאות <span className="text-muted-foreground/60">(ריק = לא מופיע)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={rotationOrder}
                  onChange={(e) => setRotationOrder(e.target.value)}
                  placeholder="—"
                  className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Last login (read-only) */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <LogIn size={14} />
                <span>התחברות אחרונה: {formatLastLogin(lastLogin)}</span>
              </div>

              {/* Save */}
              <button
                onClick={handleSaveDetails}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : detailsSaved ? (
                  <>
                    <Check size={14} /> נשמר
                  </>
                ) : (
                  "שמור שינויים"
                )}
              </button>
            </div>
          )}

          {/* ───── ONBOARDING TAB ───── */}
          {tab === "onboarding" && (
            <div className="space-y-3">
              {/* ID Photo */}
              <OnboardingItem
                icon={<FileText size={18} />}
                label="צילום תעודת זהות"
                done={!!idPhotoUrl}
                doneLabel="הועלה"
                notDoneLabel="לא הועלה"
              >
                <div className="flex items-center gap-2">
                  {idPhotoUrl && (
                    <a
                      href={idPhotoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12} /> צפה בקובץ
                    </a>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload("id_photo", f);
                    }}
                  />
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {uploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {idPhotoUrl ? "החלף" : "העלה"}
                  </button>
                </div>
              </OnboardingItem>

              {/* Contract */}
              <OnboardingItem
                icon={<ScrollText size={18} />}
                label="חוזה חתום"
                done={!!contractUrl}
                doneLabel="הועלה"
                notDoneLabel="לא הועלה"
              >
                <div className="flex items-center gap-2">
                  {contractUrl && (
                    <a
                      href={contractUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink size={12} /> צפה בקובץ
                    </a>
                  )}
                  <input
                    ref={contractInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload("contract", f);
                    }}
                  />
                  <button
                    onClick={() => contractInputRef.current?.click()}
                    disabled={uploadingContract}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {uploadingContract ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {contractUrl ? "החלף" : "העלה"}
                  </button>
                </div>
              </OnboardingItem>

              {uploadError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{uploadError}</p>
              )}

              {/* Monthly report link */}
              <OnboardingItem
                icon={<Link size={18} />}
                label="דוח חודשי"
                done={!!reportLink.trim()}
                doneLabel="קיים קישור"
                notDoneLabel="אין קישור"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={reportLink}
                    onChange={(e) => setReportLink(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                  />
                  {reportLink.trim() && (
                    <a
                      href={reportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </OnboardingItem>

              {/* WhatsApp */}
              <OnboardingItem
                icon={<MessageCircle size={18} />}
                label="צירוף לקבוצת וואצאפ"
                done={whatsapp}
                doneLabel="מאושר"
                notDoneLabel="ממתין"
              >
                <button
                  onClick={() => setWhatsapp(!whatsapp)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    whatsapp
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {whatsapp ? <Check size={12} /> : null}
                  {whatsapp ? "נוסף לקבוצה" : "סמן כנוסף"}
                </button>
              </OnboardingItem>

              {/* App access */}
              <OnboardingItem
                icon={<Smartphone size={18} />}
                label="גישה לאפליקציה"
                done={hasAppAccess}
                doneLabel={`התחבר ${formatLastLogin(lastLogin)}`}
                notDoneLabel="אין גישה"
              >
                {!hasAppAccess && (
                  <button
                    onClick={handleSync}
                    disabled={isSyncing || !instructor.phone}
                    title={!instructor.phone ? "דרוש מספר טלפון" : ""}
                    className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
                  >
                    {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    הפעל גישה
                  </button>
                )}
              </OnboardingItem>

              {/* Save onboarding */}
              <button
                onClick={handleSaveOnboarding}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : onboardingSaved ? (
                  <>
                    <Check size={14} /> נשמר
                  </>
                ) : (
                  "שמור"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OnboardingItem({
  icon,
  label,
  done,
  doneLabel,
  notDoneLabel,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  doneLabel: string;
  notDoneLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={done ? "text-green-600" : "text-muted-foreground"}>{icon}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            done ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
          }`}
        >
          {done ? doneLabel : notDoneLabel}
        </span>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
