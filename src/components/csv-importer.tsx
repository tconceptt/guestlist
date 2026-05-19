"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { parseInviteCsv, type ParsedInvite } from "@/lib/csv";

type CsvImporterProps = {
  onImport: (invites: ParsedInvite[]) => Promise<void> | void;
};

export function CsvImporter({ onImport }: CsvImporterProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("CSV columns: name, side, partySize, importance, likelihood");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const result = parseInviteCsv(text);

    if (result.imports.length > 0) {
      await onImport(result.imports);
    }

    setMessage(
      `Imported ${result.imports.length}. Skipped ${result.skipped.length}. ${
        result.errors[0] ?? ""
      }`,
    );
    event.target.value = "";
  }

  return (
    <div className="importBox">
      <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFile} hidden />
      <button className="secondaryButton" type="button" onClick={() => inputRef.current?.click()}>
        <FileUp size={16} />
        Import CSV
      </button>
      <p>{message}</p>
    </div>
  );
}
