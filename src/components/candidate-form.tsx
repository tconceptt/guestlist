"use client";

import { FormEvent, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import {
  importanceLabels,
  likelihoodLabels,
  SIDES,
  type InviteSide,
  type InviteStatus,
  type ScaleValue,
} from "@/lib/labels";

export type InviteFormValues = {
  name: string;
  side: InviteSide;
  partySize: number;
  relationship: string;
  importance: ScaleValue;
  likelihood: ScaleValue;
  notes: string;
  status?: InviteStatus;
};

type CandidateFormProps = {
  initialValues?: Partial<InviteFormValues>;
  submitLabel?: string;
  compact?: boolean;
  onSubmit: (values: InviteFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

const defaultValues: InviteFormValues = {
  name: "",
  side: "Both",
  partySize: 1,
  relationship: "",
  importance: 3,
  likelihood: 3,
  notes: "",
  status: "candidate",
};

const scaleValues: ScaleValue[] = [1, 2, 3, 4, 5];

export function CandidateForm({
  initialValues,
  submitLabel = "Add candidate",
  compact = false,
  onSubmit,
  onCancel,
}: CandidateFormProps) {
  const [values, setValues] = useState<InviteFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        relationship: values.relationship.trim(),
        notes: values.notes.trim(),
      });
      if (!initialValues) {
        setValues(defaultValues);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={compact ? "inviteForm compact" : "inviteForm"} onSubmit={handleSubmit}>
      <label>
        Name
        <input
          value={values.name}
          onChange={(event) => setValues({ ...values, name: event.target.value })}
          placeholder="Auntie Selam"
          required
        />
      </label>

      <label>
        Side
        <select
          value={values.side}
          onChange={(event) => setValues({ ...values, side: event.target.value as InviteSide })}
        >
          {SIDES.map((side) => (
            <option key={side} value={side}>
              {side}
            </option>
          ))}
        </select>
      </label>

      <label>
        Party size
        <input
          min={1}
          max={20}
          type="number"
          value={values.partySize}
          onChange={(event) =>
            setValues({ ...values, partySize: Number.parseInt(event.target.value, 10) || 1 })
          }
        />
      </label>

      <label>
        Relationship
        <input
          value={values.relationship}
          onChange={(event) => setValues({ ...values, relationship: event.target.value })}
          placeholder="Family, school, coworker"
        />
      </label>

      <label>
        Importance
        <select
          value={values.importance}
          onChange={(event) =>
            setValues({ ...values, importance: Number(event.target.value) as ScaleValue })
          }
        >
          {scaleValues.map((value) => (
            <option key={value} value={value}>
              {value} - {importanceLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Chance
        <select
          value={values.likelihood}
          onChange={(event) =>
            setValues({ ...values, likelihood: Number(event.target.value) as ScaleValue })
          }
        >
          {scaleValues.map((value) => (
            <option key={value} value={value}>
              {value} - {likelihoodLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="notesField">
        Notes
        <textarea
          value={values.notes}
          onChange={(event) => setValues({ ...values, notes: event.target.value })}
          placeholder="Context, family link, or decision note"
          rows={compact ? 2 : 3}
        />
      </label>

      <div className="formActions">
        {onCancel ? (
          <button className="secondaryButton" type="button" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
        ) : null}
        <button className="primaryButton" type="submit" disabled={isSaving}>
          {initialValues ? <Save size={16} /> : <Plus size={16} />}
          {isSaving ? "Saving" : submitLabel}
        </button>
      </div>
    </form>
  );
}
