"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileText } from "lucide-react";
import InvoicePdf, { type InvoiceData } from "@/components/InvoicePdf";

export default function PdfDownload({ data, fileName }: { data: InvoiceData; fileName: string }) {
  return (
    <PDFDownloadLink
      document={<InvoicePdf data={data} />}
      fileName={fileName}
      className="button primary small"
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => <><FileText size={14}/>{loading ? "Preparing…" : "Download PDF"}</>}
    </PDFDownloadLink>
  );
}
