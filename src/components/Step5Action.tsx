import { useState, useRef } from "react";
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
  Sparkles,
  Printer,
  CheckCircle2,
  BookmarkPlus,
  Loader2,
  User,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Scale,
} from "lucide-react";
import jsPDF from "jspdf";
import type { FormState } from "../types";
import { formatIncidentDate } from "../types";
import { DOMAIN_FACTS } from "../mockData";
import { Card, SectionTitle, Button, Badge } from "./ui";

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

  // Local overrides for personalization if onUpdateForm is not passed
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

  // Dynamic Draft Texts
  const grievanceDraft = `FORMAL LEGAL GRIEVANCE & DEMAND NOTICE
(Under ${statutoryRef})

Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
Ref: RN/${(form.domain || "CASE").substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}

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

  const rtiDraft = `APPLICATION FOR OBTAINING INFORMATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

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
        // Page header rule
        doc.setDrawColor(220, 225, 235);
        doc.setLineWidth(0.3);
        doc.line(margin, y - 3, pageWidth - margin, y - 3);
      }
    };

    // 1. Top Decorative Header Banner
    doc.setFillColor(15, 23, 42); // Deep Navy (#0f172a)
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "F");

    // Gold/Emerald highlight accent line
    doc.setFillColor(99, 102, 241); // Royal Indigo
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

    // 2. Metadata Reference Bar
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    const refCode = `RN/${(form.domain || "CASE").substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    doc.text(`REF: ${refCode}`, margin + 4, y + 7.5);
    doc.text(
      `DATE: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
      pageWidth / 2 - 10,
      y + 7.5
    );
    doc.text(`JURISDICTION: ${form.district || "Dist."}, ${form.state || "State"}`, pageWidth - margin - 4, y + 7.5, {
      align: "right",
    });

    y += 18;

    // 3. Parties Box (From & To)
    const boxWidth = (contentWidth - 6) / 2;
    const boxHeight = 32;

    // "From" Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, boxWidth, boxHeight, 1.5, 1.5, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
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

    // "To" Box
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

    // 4. Subject Line
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, "FD");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 27, 75);
    const subjText = `SUBJECT: FORMAL NOTICE REGARDING ${String(form.domain || "DISPUTE").toUpperCase()} MATTER (${dateDisplay})`;
    doc.text(subjText, margin + 4, y + 6.5);

    y += 16;

    // Helper to render section headings
    const renderHeading = (num: string, title: string) => {
      checkPageBreak(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${num}. ${title}`, margin, y);
      y += 5.5;
    };

    // Helper to render body paragraphs
    const renderParagraph = (text: string, indent = 0) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      checkPageBreak(lines.length * 4.5);
      doc.text(lines, margin + indent, y);
      y += lines.length * 4.5 + 3.5;
    };

    // Section 1: Statement of Confirmed Facts
    renderHeading("1", "STATEMENT OF CONFIRMED STATUTORY FACTS");
    if (confirmedFactLabels.length > 0) {
      confirmedFactLabels.forEach((fact, idx) => {
        renderParagraph(`(${String.fromCharCode(97 + idx)}) ${fact}`, 4);
      });
    } else {
      renderParagraph("(a) Grievance facts recorded as per citizen intake statement.", 4);
    }

    // Section 2: Narrative & Cause of Action
    renderHeading("2", "INCIDENT CHRONOLOGY & CAUSE OF ACTION");
    const cleanNarrative = form.narrative.trim() || "The complainant experienced substantial hardship, monetary loss, and deficiency of service as specified herein.";
    renderParagraph(cleanNarrative, 4);

    // Section 3: Statutory Grounds
    renderHeading("3", "STATUTORY PROVISIONS & LEGAL GROUNDS");
    renderParagraph(
      `The opposite party's acts and defaults constitute actionable non-compliance under ${statutoryRef}. The complainant reserves all statutory remedies under Indian law.`,
      4
    );

    // Section 4: Demand & Relief
    renderHeading("4", "DEMAND & FORMAL NOTICE TO REMEDY");
    renderParagraph(
      `You are hereby called upon to remedy the grievance and fulfill the following prayer within 15 (FIFTEEN) DAYS of receipt of this notice:\n• ${demandRelief}\n• Acknowledge receipt of this notice in writing with resolution timeline.`,
      4
    );

    // Section 5: Signature & Verification Block
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

    // 5. Professional Footer on all pages
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
      const token = localStorage.getItem('token');
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
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
          assessmentData: {
            status: "supported",
            statutes: [],
          },
          noticeDraft: currentDraftText,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setSavedId(json.case?.id || "Saved");
        setTimeout(() => setSavedId(null), 3500);
      }
    } catch (e) {
      console.error("Error saving case in Step 5:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <SectionTitle
        step={5}
        title="Action Studio & Document Generation"
        subtitle="Export court-grade legal notices, customized RTI applications, and connect directly to official government grievance portals."
        badgeText="Step 5 of 5"
      />

      {/* Completion Banner */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-emerald-950">
              Statutory Evaluation Complete &amp; Action Templates Ready
            </h4>
            <Badge variant="emerald" dot>
              Ready to Dispatch
            </Badge>
          </div>
          <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
            Personalized legal notice compiled for <span className="font-semibold">{form.domain || "Dispute"}</span> in{" "}
            <span className="font-semibold">{form.district ? `${form.district}, ` : ""}{form.state || "state jurisdiction"}</span>.
          </p>
        </div>
      </div>

      {/* Personalization Details Card */}
      <div className="mb-6 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40 p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-indigo-100/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Personalize Notice &amp; PDF Signatures
              </h4>
              <p className="text-[11px] text-slate-500">
                Enter your details to generate professional documents with real names and addresses.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPersonalize(!showPersonalize)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showPersonalize ? "Collapse Details" : "Edit Details"}
          </button>
        </div>

        {showPersonalize && (
          <div className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Your Full Name (Applicant / Complainant) *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar Sharma"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Opposite Party / Company / Landlord / Employer *
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={oppositePartyName}
                    onChange={(e) => setOppositePartyName(e.target.value)}
                    placeholder="e.g. Apex Consumer Appliances Pvt. Ltd."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. Phone Number / Email
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210 | rajesh@email.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Your Full Postal Address
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={applicantAddress}
                    onChange={(e) => setApplicantAddress(e.target.value)}
                    placeholder="e.g. Flat 302, Palm Heights, Andheri West"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. Specific Remedy / Demand Claimed (15-Day Resolution)
              </label>
              <textarea
                value={demandRelief}
                onChange={(e) => setDemandRelief(e.target.value)}
                rows={2}
                placeholder="Specify the exact refund amount, replacement, or action demanded..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Selector Tabs & Copy Action */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            onClick={() => setActiveTab("notice")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "notice"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Formal Legal Notice</span>
          </button>
          <button
            onClick={() => setActiveTab("rti")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === "rti"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>RTI Section 6(1) Draft</span>
          </button>
        </div>

        <Button variant="outline" size="sm" onClick={handleCopy} className="self-start sm:self-auto">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied to Clipboard" : "Copy Draft Text"}</span>
        </Button>
      </div>

      {/* Draft Document Viewport (macOS-style window) */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 font-mono text-[11px] text-slate-400">
              {activeTab === "notice" ? "formal_legal_notice.txt" : "rti_application_sec6.txt"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
            Live Personalized Draft
          </span>
        </div>

        <div ref={noticeRef} className="max-h-[380px] overflow-y-auto p-5 font-mono text-xs leading-relaxed text-slate-200">
          <pre className="whitespace-pre-wrap font-mono">{currentDraftText}</pre>
        </div>
      </div>

      {/* PDF Export Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              Download Court-Grade PDF Document
            </h4>
            <Badge variant="indigo">Official Legal Print Format</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Formatted with official case header, formal sender &amp; receiver boxes, statutory citations, and verification signature block.
          </p>
        </div>

        <Button onClick={handleExportPdf} variant="primary" size="md" className="shadow-md">
          <Download className="h-4 w-4" />
          <span>Download {activeTab === "notice" ? "Legal Notice" : "RTI"} PDF</span>
        </Button>
      </div>

      {/* Official Government Portals */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
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
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  Consumer Commission
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">e-Daakhil</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Online filing with National, State &amp; District Consumer Dispute Redressal Commissions.
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-indigo-600 group-hover:underline">
              Visit edaakhil.nic.in &rarr;
            </div>
          </a>

          <a
            href="https://rtionline.gov.in"
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                  Transparency &amp; RTI
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">RTI Online</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Submit Right to Information applications directly to Central &amp; State Ministries.
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-purple-600 group-hover:underline">
              Visit rtionline.gov.in &rarr;
            </div>
          </a>

          <a
            href="https://consumerhelpline.gov.in"
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Helpline 1915
                </span>
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">NCH Portal</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                National Consumer Helpline docket registration, mediation assistance &amp; grievance tracking.
              </p>
            </div>
            <div className="mt-3 text-[11px] font-bold text-emerald-600 group-hover:underline">
              Visit consumerhelpline.gov.in &rarr;
            </div>
          </a>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assessment</span>
        </Button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="md"
            onClick={handleSaveToVault}
            disabled={isSaving}
            className={savedId ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-bold" : ""}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : savedId ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Saved as {savedId}!</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4 text-indigo-600" />
                <span>Save Dossier to Vault</span>
              </>
            )}
          </Button>

          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            <span>Start New</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
