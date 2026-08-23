import { useState, useRef, useMemo } from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  BookmarkPlus,
  Loader2,
  User,
  MapPin,
  Phone,
  Edit3,
} from "lucide-react";
import jsPDF from "jspdf";
import type { FormState } from "../types";
import { formatIncidentDate } from "../types";
import { DOMAIN_FACTS } from "../mockData";
import { Card, Button, Badge } from "./ui";

interface Step5Props {
  form: FormState;
  onBack: () => void;
  onReset: () => void;
  onUpdateForm?: (patch: Partial<FormState>) => void;
}

export default function Step5Action({ form, onBack, onReset, onUpdateForm }: Step5Props) {
  const [activeTab, setActiveTab] = useState<"notice" | "rti">("notice");
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [showPersonalize, setShowPersonalize] = useState(true);

  // Local overrides for personalization
  const [applicantName, setApplicantName] = useState(form.applicantName || "");
  const [applicantPhone, setApplicantPhone] = useState(form.applicantPhone || "");
  const [applicantEmail, setApplicantEmail] = useState(form.applicantEmail || "");
  const [applicantAddress, setApplicantAddress] = useState(form.applicantAddress || "");
  const [oppositePartyName, setOppositePartyName] = useState(form.oppositePartyName || "");
  const [oppositePartyAddress, setOppositePartyAddress] = useState(form.oppositePartyAddress || "");
  const [demandRelief, setDemandRelief] = useState(
    form.demandRelief ||
      (form.domain === "Consumer"
        ? "Full refund of the purchase amount along with replacement and compensation of Rs. 10,000/- for deficiency in service."
        : form.domain === "Workplace"
        ? "Immediate release of all unpaid salary dues, gratuity entitlements, and statutory interest."
        : "Immediate refund of the full security deposit and cessation of unlawful eviction proceedings.")
  );

  const noticeRef = useRef<HTMLDivElement>(null);

  const confirmedFactLabels: string[] = form.domain
    ? (DOMAIN_FACTS[form.domain] ?? [])
        .filter((f) => form.confirmedFacts.includes(f.id))
        .map((f) => f.label)
    : [];

  const dateDisplay = formatIncidentDate(form) || "Not specified";
  const effectiveApplicantName = applicantName.trim() || "[Your Full Name]";
  const effectiveOppositeParty = oppositePartyName.trim() || "[Opposite Party / Organization Name]";
  const effectiveApplicantContact =
    [applicantPhone.trim(), applicantEmail.trim()].filter(Boolean).join(" | ") || "[Your Phone / Email]";
  const effectiveApplicantAddress = applicantAddress.trim() || `${form.district || "[District]"}, ${form.state || "[State]"}`;
  const effectiveOppositeAddress =
    oppositePartyAddress.trim() || `Branch / Registered Office, ${form.district || "[District]"}, ${form.state || "[State]"}`;

  const statutoryRef =
    form.domain === "Consumer"
      ? "Consumer Protection Act, 2019 (Sections 35, 84 & 85) read with Consumer Protection (E-Commerce) Rules, 2020"
      : form.domain === "Workplace"
      ? "Code on Wages, 2019 (Section 17) / Payment of Gratuity Act, 1972 & Industrial Disputes Act, 1947"
      : `State Rent Control Legislation (${form.state || "State"}) and Applicable Model Tenancy Principles`;

  // Stable Reference Number using useMemo to prevent jitter on keystrokes
  const caseRefCode = useMemo(() => {
    return `RN/${(form.domain || "CASE").substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
  }, [form.domain]);

  // Dynamic Draft Texts memoized for performance and stability
  const grievanceDraft = useMemo(() => {
    return `FORMAL LEGAL GRIEVANCE & DEMAND NOTICE
(Under ${statutoryRef})

Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
Ref: ${caseRefCode}

FROM:
${effectiveApplicantName}
Address: ${effectiveApplicantAddress}
Contact: ${effectiveApplicantContact}

TO:
${effectiveOppositeParty}
Address: ${effectiveOppositeAddress}

SUBJECT: FORMAL LEGAL NOTICE REGARDING ${String(form.domain || "DISPUTE").toUpperCase()} MATTER OCCURRING IN ${String(form.district || "").toUpperCase()}, ${String(form.state || "").toUpperCase()}

Sir/Madam,

Under instructions and information provided by the undersigned, this formal grievance notice is hereby served upon you as follows:

1. JURISDICTION & TIMELINE:
The dispute arose within the territorial limits of ${form.district || "[District]"}, ${form.state || "[State]"} on or around ${dateDisplay}.

2. STATEMENT OF CONFIRMED FACTS:
${
  confirmedFactLabels.length > 0
    ? confirmedFactLabels.map((f, i) => `   (${String.fromCharCode(97 + i)}) ${f}`).join("\n")
    : "   (a) The claimant transacted in good faith with the opposite party.\n   (b) Formal objections and grievances were brought to notice."
}

3. FACTUAL CHRONOLOGY / NARRATIVE:
${form.narrative ? form.narrative.trim() : "The complainant suffered substantial grievance, monetary loss, and deficiency of service as detailed in the statement of claim."}

4. STATUTORY BASIS & VIOLATIONS:
Your acts and omissions constitute actionable violations under ${statutoryRef}.

5. FORMAL DEMAND / NOTICE TO REMEDY:
You are hereby called upon to comply with the following demands within FIFTEEN (15) DAYS of receipt of this notice:
   (i) ${demandRelief}
   (ii) Cease and desist from any further unfair trade practices or unlawful actions.

Failing which, the undersigned shall be constrained to initiate appropriate legal proceedings before the competent Consumer Disputes Redressal Commission / Labor Tribunal / Rent Authority, holding you liable for all consequential costs and damages.

Yours faithfully,

_____________________________
${effectiveApplicantName}
(Complainant / Claimant)
Place: ${form.district || "[District]"}, ${form.state || "[State]"}`;
  }, [
    statutoryRef,
    caseRefCode,
    effectiveApplicantName,
    effectiveApplicantAddress,
    effectiveApplicantContact,
    effectiveOppositeParty,
    effectiveOppositeAddress,
    form.domain,
    form.district,
    form.state,
    dateDisplay,
    confirmedFactLabels,
    form.narrative,
    demandRelief,
  ]);

  const rtiDraft = useMemo(() => {
    return `APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer (PIO)
Office of the Competent Regulatory Authority / Appellate Department
District: ${form.district || "[District]"}, State: ${form.state || "[State]"}

1. Full Name of Applicant: ${effectiveApplicantName}
2. Address for Correspondence: ${effectiveApplicantAddress}
3. Contact Details: ${effectiveApplicantContact}

4. Subject Matter of Information:
Information and certified records concerning ${form.domain || "Dispute"} regulatory oversight in ${form.district || "this jurisdiction"} related to incident dated ${dateDisplay}.

5. Specific Information Requested:
   i. Certified copies of citizen grievance redressal SOPs and timeframes applicable to ${form.domain || "consumer/tenant"} disputes in ${form.district || "[District]"}.
   ii. Action Taken Report (ATR) and file inspection notes on complaints submitted against ${effectiveOppositeParty}.
   iii. Certified list of statutory appellate authorities and designated grievance officers empowered to adjudicate this dispute.

6. Period to which information relates: ${dateDisplay} to present date.
7. Application Fee Details: Rs. 10/- paid via IPO / Online Portal Payment Gateway.
8. Citizen Declaration: I hereby declare that I am a citizen of India and the information sought falls within the mandate of Section 6(1) of RTI Act, 2005.

Place: ${form.district || "[District]"}
Date: ${new Date().toISOString().split("T")[0]}

_____________________________
Signature of Applicant (${effectiveApplicantName})`;
  }, [
    form.district,
    form.state,
    effectiveApplicantName,
    effectiveApplicantAddress,
    effectiveApplicantContact,
    form.domain,
    dateDisplay,
    effectiveOppositeParty,
  ]);

  const currentDraftText = activeTab === "notice" ? grievanceDraft : rtiDraft;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDraftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // High-Resolution Court-Grade PDF Exporter
  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 18) {
        doc.addPage();
        y = margin + 5;
        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, y - 3, pageWidth - margin, y - 3);
      }
    };

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");

    doc.setFillColor(16, 185, 129);
    doc.rect(margin, y + 23, contentWidth, 1.2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    const headerTitle =
      activeTab === "notice"
        ? "FORMAL LEGAL GRIEVANCE & DEMAND NOTICE"
        : "APPLICATION UNDER SECTION 6(1) OF RTI ACT, 2005";
    doc.text(headerTitle, pageWidth / 2, y + 10, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    const subHeader =
      activeTab === "notice"
        ? `Statutory Notice under ${form.domain || "Legal"} Laws • Government of India Bare Acts`
        : "Statutory Right to Information Filing • Transparency & Accountability";
    doc.text(subHeader, pageWidth / 2, y + 17, { align: "center" });

    y += 31;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(`REF: ${caseRefCode}`, margin + 4, y + 7.5);
    doc.text(
      `DATE: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
      pageWidth / 2 - 10,
      y + 7.5
    );
    doc.text(`JURISDICTION: ${form.district || "Dist."}, ${form.state || "State"}`, pageWidth - margin - 4, y + 7.5, {
      align: "right",
    });

    y += 18;

    const boxWidth = (contentWidth - 6) / 2;
    const boxHeight = 32;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 1.5, 1.5, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("FROM (COMPLAINANT / APPLICANT):", margin + 3, y + 5.5);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(effectiveApplicantName, margin + 3, y + 11.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const fromAddrLines = doc.splitTextToSize(effectiveApplicantAddress, boxWidth - 6);
    doc.text(fromAddrLines.slice(0, 2), margin + 3, y + 17);
    doc.text(`Contact: ${effectiveApplicantContact}`, margin + 3, y + 27);

    const toBoxX = margin + boxWidth + 6;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(toBoxX, y, boxWidth, boxHeight, 1.5, 1.5, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text("TO (OPPOSITE PARTY / RESPONDENT):", toBoxX + 3, y + 5.5);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(effectiveOppositeParty, toBoxX + 3, y + 11.5);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const toAddrLines = doc.splitTextToSize(effectiveOppositeAddress, boxWidth - 6);
    doc.text(toAddrLines.slice(0, 2), toBoxX + 3, y + 17);
    doc.text("Designation: Authorized Officer / Grievance Cell", toBoxX + 3, y + 27);

    y += boxHeight + 8;

    doc.setFillColor(6, 78, 59);
    doc.setDrawColor(5, 150, 105);
    doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, "FD");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(209, 250, 229);
    const subjText = `SUBJECT: FORMAL NOTICE REGARDING ${String(form.domain || "DISPUTE").toUpperCase()} MATTER (${dateDisplay})`;
    doc.text(subjText, margin + 4, y + 6.5);

    y += 16;

    const renderHeading = (num: string, title: string) => {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${num}. ${title}`, margin, y);
      y += 5.5;
    };

    const renderParagraph = (text: string, indent = 0) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      checkPageBreak(lines.length * 4.5);
      doc.text(lines, margin + indent, y);
      y += lines.length * 4.5 + 3.5;
    };

    renderHeading("1", "STATEMENT OF CONFIRMED STATUTORY FACTS");
    if (confirmedFactLabels.length > 0) {
      confirmedFactLabels.forEach((fact, idx) => {
        renderParagraph(`(${String.fromCharCode(97 + idx)}) ${fact}`, 4);
      });
    } else {
      renderParagraph("(a) Grievance facts recorded as per citizen intake statement.", 4);
    }

    renderHeading("2", "INCIDENT CHRONOLOGY & CAUSE OF ACTION");
    const cleanNarrative = form.narrative.trim() || "The complainant experienced substantial hardship, monetary loss, and deficiency of service as specified herein.";
    renderParagraph(cleanNarrative, 4);

    renderHeading("3", "STATUTORY PROVISIONS & LEGAL GROUNDS");
    renderParagraph(
      `The opposite party's acts and defaults constitute actionable non-compliance under ${statutoryRef}. The complainant reserves all statutory remedies under Indian law.`,
      4
    );

    renderHeading("4", "DEMAND & FORMAL NOTICE TO REMEDY");
    renderParagraph(
      `You are hereby called upon to remedy the grievance and fulfill the following prayer within 15 (FIFTEEN) DAYS of receipt of this notice:\n• ${demandRelief}\n• Acknowledge receipt of this notice in writing with resolution timeline.`,
      4
    );

    checkPageBreak(38);
    y += 4;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("VERIFICATION & SIGNATURE", margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "I hereby verify that the contents stated above are true and correct to the best of my knowledge and belief.",
      margin + 4,
      y + 12
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${effectiveApplicantName}`, margin + 4, y + 22);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Place: ${form.district || "[District]"}, ${form.state || "[State]"}`, margin + 4, y + 26.5);

    doc.text("Signature / Seal: ____________________________", pageWidth - margin - 65, y + 24);

    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("Rights Navigator • Grounded Legal Navigation System • Informational Notice Draft", margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: "right" });
    }

    doc.save(`${activeTab === "notice" ? "Legal-Grievance-Notice" : "RTI-Application"}-${form.domain || "Case"}.pdf`);
  };

  const handleSaveToVault = async () => {
    try {
      setIsSaving(true);
      
      const newCaseObj = {
        id: caseRefCode,
        createdAt: new Date().toISOString(),
        domain: form.domain || "General",
        state: form.state || "",
        district: form.district || "",
        incidentDate: dateDisplay,
        status: "supported" as const,
        matchedStatutesCount: confirmedFactLabels.length || 2,
        statutes: [{ title: statutoryRef, statute: "Section 1", summary: "Verified statutory match" }],
        formState: {
          ...form,
          applicantName,
          applicantPhone,
          applicantEmail,
          applicantAddress,
          oppositePartyName,
          oppositePartyAddress,
          demandRelief,
        },
        assessmentData: { status: "supported", statutes: [] },
        noticeDraft: currentDraftText,
      };

      const existing = localStorage.getItem('rights_navigator_vault');
      const parsed = existing ? JSON.parse(existing) : [];
      const updated = [newCaseObj, ...(Array.isArray(parsed) ? parsed : [])];
      localStorage.setItem('rights_navigator_vault', JSON.stringify(updated));

      const token = localStorage.getItem('token');
      fetch("/api/cases", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "Bearer guest" 
        },
        body: JSON.stringify({
          formState: newCaseObj.formState,
          assessmentData: newCaseObj.assessmentData,
          noticeDraft: currentDraftText,
        }),
      }).catch(err => console.log("Background API sync skipped:", err));

      setSavedId(newCaseObj.id);
      setTimeout(() => setSavedId(null), 3500);
    } catch (e) {
      console.error("Error saving case:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl bg-slate-900 border-slate-800 text-slate-100 shadow-xl"
    >
      {/* Step Title Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/20">
              5
            </div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight sm:text-2xl">
              Action Studio &amp; Document Generation
            </h2>
          </div>

          <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-800">
            Step 5 of 5
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-400 sm:text-sm leading-relaxed">
          Export court-grade legal notices, customized RTI applications, and connect directly to official government grievance portals.
        </p>
      </div>

      {/* Completion Banner */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-900 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-100">
              Statutory Evaluation Complete &amp; Action Templates Ready
            </h4>
            <Badge variant="emerald" dot>
              Ready to Dispatch
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Personalized legal notice compiled for <span className="font-semibold text-slate-200">{form.domain || "Dispute"}</span> in{" "}
            <span className="font-semibold text-slate-200">{form.district ? `${form.district}, ` : ""}{form.state || "state jurisdiction"}</span>.
          </p>
        </div>
      </div>

      {/* Personalization Details Card */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">
                Personalize Notice &amp; PDF Signatures
              </h4>
              <p className="text-[11px] text-slate-400">
                Enter your details to generate professional documents with real names and addresses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPersonalize(!showPersonalize)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {showPersonalize ? "Collapse Details" : "Edit Details"}
          </button>
        </div>

        {showPersonalize && (
          <div className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. Your Full Name (Applicant / Complainant) *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar Sharma"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3.5 text-xs font-medium text-slate-200 shadow-sm placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. Opposite Party / Company / Landlord / Employer *
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={oppositePartyName}
                    onChange={(e) => setOppositePartyName(e.target.value)}
                    placeholder="e.g. Apex Consumer Appliances Pvt. Ltd."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3.5 text-xs font-medium text-slate-200 shadow-sm placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  3. Phone Number / Email
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210 | rajesh@email.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3.5 text-xs font-medium text-slate-200 shadow-sm placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  4. Your Full Postal Address
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={applicantAddress}
                    onChange={(e) => setApplicantAddress(e.target.value)}
                    placeholder="e.g. Flat 302, Palm Heights, Andheri West"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3.5 text-xs font-medium text-slate-200 shadow-sm placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                5. Specific Remedy / Demand Claimed (15-Day Resolution)
              </label>
              <textarea
                value={demandRelief}
                onChange={(e) => setDemandRelief(e.target.value)}
                rows={2}
                placeholder="Specify the exact refund amount, replacement, or action demanded..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-medium text-slate-200 shadow-sm placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Selector Tabs & Copy Action */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("notice")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "notice"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Formal Legal Notice</span>
          </button>
          <button
            onClick={() => setActiveTab("rti")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "rti"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>RTI Section 6(1) Draft</span>
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={handleCopy} className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 self-start sm:self-auto">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied to Clipboard" : "Copy Draft Text"}</span>
        </Button>
      </div>

      {/* Dark-Themed Legal Document Paper Preview */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-xs text-slate-200">
              {activeTab === "notice" ? "Formal Legal Notice Preview" : "RTI Section 6(1) Application Preview"}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
            Official Court Paper Format
          </span>
        </div>

        <div ref={noticeRef} className="max-h-[420px] overflow-y-auto p-8 font-sans text-xs leading-relaxed text-slate-200 bg-slate-950 shadow-inner m-3 rounded-lg border border-slate-800/80">
          <pre className="whitespace-pre-wrap font-sans text-slate-200">{currentDraftText}</pre>
        </div>
      </div>

      {/* PDF Export Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-900 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-100">
              Download Court-Grade PDF Document
            </h4>
            <Badge variant="emerald">Official Legal Print Format</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Formatted with official case header, formal sender &amp; receiver boxes, statutory citations, and verification signature block.
          </p>
        </div>

        <Button onClick={handleExportPdf} variant="primary" size="md" className="shadow-md bg-emerald-600 hover:bg-emerald-500 text-white">
          <Download className="h-4 w-4" />
          <span>Download {activeTab === "notice" ? "Legal Notice" : "RTI"} PDF</span>
        </Button>
      </div>

      {/* Official Government Portals */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
              Official Grievance Portals
            </h3>
            <Badge variant="emerald" dot>
              Direct Access
            </Badge>
          </div>
          <span className="text-xs text-slate-400">Government of India</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-3">
          <a
            href="https://edaakhil.nic.in"
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4.5 shadow-sm transition-all duration-200 hover:border-emerald-600 hover:bg-slate-800/80 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                  Consumer Commission
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">e-Daakhil</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Online filing with National, State &amp; District Consumer Dispute Redressal Commissions.
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-emerald-400 group-hover:underline">
              Visit edaakhil.nic.in &rarr;
            </div>
          </a>

          <a
            href="https://rtionline.gov.in"
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4.5 shadow-sm transition-all duration-200 hover:border-emerald-600 hover:bg-slate-800/80 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                  Transparency &amp; RTI
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">RTI Online</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Submit Right to Information applications directly to Central &amp; State Ministries.
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-emerald-400 group-hover:underline">
              Visit rtionline.gov.in &rarr;
            </div>
          </a>

          <a
            href="https://consumerhelpline.gov.in"
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900 p-4.5 shadow-sm transition-all duration-200 hover:border-emerald-600 hover:bg-slate-800/80 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                  Helpline 1915
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-100">NCH Portal</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                National Consumer Helpline docket registration, mediation assistance &amp; grievance tracking.
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-emerald-400 group-hover:underline">
              Visit consumerhelpline.gov.in &rarr;
            </div>
          </a>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-6">
        <Button variant="ghost" onClick={onBack} className="text-slate-300 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assessment</span>
        </Button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="md"
            onClick={handleSaveToVault}
            disabled={isSaving}
            className={savedId ? "border-emerald-700 bg-emerald-950 text-emerald-300 font-bold" : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : savedId ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Saved as {savedId}!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 text-emerald-400" />
                <span>Save Dossier to Vault</span>
              </>
            )}
          </Button>

          <Button variant="outline" onClick={onReset} className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
            <RotateCcw className="h-4 w-4" />
            <span>Start New</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
