/**
 * @fileoverview Structured editor for Pre-Transition Outline (PTO) activities.
 * Provides labeled input fields for thesis, body paragraphs with topic sentences
 * and supporting details, and concluding statement.
 */

'use client';

import { useCallback } from 'react';

/** Paragraph outline structure */
interface ParagraphOutline {
  ts: string;
  sd: string[];
}

/** PTO data structure matching AlphaWrite schema */
export interface PTOData {
  thesisStatement: string;
  paragraphOutlines: ParagraphOutline[];
  concludingStatement: string;
}

interface PTOEditorProps {
  /** Current PTO data */
  value: PTOData;
  /** Callback when data changes */
  onChange: (data: PTOData) => void;
  /** Whether the editor is in revision mode */
  isRevision?: boolean;
}

/**
 * @description Structured editor for Pre-Transition Outline activities.
 * Displays fields for thesis, multiple paragraphs (each with TS + SDs), and conclusion.
 */
export function PTOEditor({ value, onChange, isRevision = false }: PTOEditorProps) {
  /**
   * @description Update the thesis statement.
   */
  const handleThesisChange = useCallback(
    (newValue: string) => {
      onChange({ ...value, thesisStatement: newValue });
    },
    [value, onChange]
  );

  /**
   * @description Update a paragraph's topic sentence.
   */
  const handleParagraphTSChange = useCallback(
    (paragraphIndex: number, newValue: string) => {
      const newOutlines = [...value.paragraphOutlines];
      newOutlines[paragraphIndex] = {
        ...newOutlines[paragraphIndex],
        ts: newValue,
      };
      onChange({ ...value, paragraphOutlines: newOutlines });
    },
    [value, onChange]
  );

  /**
   * @description Update a paragraph's supporting detail.
   */
  const handleParagraphSDChange = useCallback(
    (paragraphIndex: number, detailIndex: number, newValue: string) => {
      const newOutlines = [...value.paragraphOutlines];
      const newSD = [...newOutlines[paragraphIndex].sd];
      newSD[detailIndex] = newValue;
      newOutlines[paragraphIndex] = {
        ...newOutlines[paragraphIndex],
        sd: newSD,
      };
      onChange({ ...value, paragraphOutlines: newOutlines });
    },
    [value, onChange]
  );

  /**
   * @description Update the concluding statement.
   */
  const handleConclusionChange = useCallback(
    (newValue: string) => {
      onChange({ ...value, concludingStatement: newValue });
    },
    [value, onChange]
  );

  return (
    <div className="space-y-6">
      {/* Thesis Statement */}
      <div className="rounded-lg border border-[rgba(0,229,229,0.2)] bg-[rgba(0,229,229,0.03)] p-4">
        <FieldRow
          label="Thesis"
          labelFull="Thesis Statement"
          value={value.thesisStatement}
          onChange={handleThesisChange}
          placeholder={isRevision ? 'Revise your thesis statement...' : 'Write your thesis statement...'}
          isTextarea
        />
      </div>

      {/* Body Paragraphs */}
      {value.paragraphOutlines.map((paragraph, pIndex) => (
        <div
          key={pIndex}
          className="rounded-lg border border-[rgba(0,0,0,0.08)] bg-[rgba(0,0,0,0.02)] p-4"
        >
          <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[rgba(0,0,0,0.5)]">
            Paragraph {pIndex + 1}
          </div>

          <div className="space-y-4">
            {/* Topic Sentence */}
            <FieldRow
              label="T.S."
              labelFull="Topic Sentence"
              value={paragraph.ts}
              onChange={(v) => handleParagraphTSChange(pIndex, v)}
              placeholder={
                isRevision
                  ? `Revise paragraph ${pIndex + 1} topic sentence...`
                  : `Write paragraph ${pIndex + 1} topic sentence...`
              }
            />

            {/* Supporting Details */}
            {paragraph.sd.map((detail, dIndex) => (
              <FieldRow
                key={dIndex}
                label={`SD${dIndex + 1}`}
                labelFull={`Supporting Detail ${dIndex + 1}`}
                value={detail}
                onChange={(v) => handleParagraphSDChange(pIndex, dIndex, v)}
                placeholder={
                  isRevision
                    ? `Revise supporting detail ${dIndex + 1}...`
                    : `Write supporting detail ${dIndex + 1}...`
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* Concluding Statement */}
      <div className="rounded-lg border border-[rgba(0,212,146,0.2)] bg-[rgba(0,212,146,0.03)] p-4">
        <FieldRow
          label="Conclusion"
          labelFull="Concluding Statement"
          value={value.concludingStatement}
          onChange={handleConclusionChange}
          placeholder={
            isRevision ? 'Revise your concluding statement...' : 'Write your concluding statement...'
          }
          isTextarea
        />
      </div>
    </div>
  );
}

interface FieldRowProps {
  label: string;
  labelFull: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isTextarea?: boolean;
}

/**
 * @description A single labeled input field with dashed underline styling.
 */
function FieldRow({
  label,
  labelFull,
  value,
  onChange,
  placeholder,
  isTextarea = false,
}: FieldRowProps) {
  const labelColor =
    label === 'Thesis'
      ? 'bg-[rgba(0,229,229,0.15)] text-[#00b8b8]'
      : label === 'Conclusion'
        ? 'bg-[rgba(0,212,146,0.15)] text-[#00a876]'
        : 'bg-[rgba(0,229,229,0.1)] text-[#00e5e5]';

  return (
    <div className="group">
      {/* Label */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${labelColor}`}>{label}</span>
        <span className="text-xs text-[rgba(0,0,0,0.4)]">{labelFull}</span>
      </div>

      {/* Input with dashed underline */}
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none border-b-2 border-dashed border-[rgba(0,0,0,0.15)] bg-transparent py-2 text-base text-[#1b1f24] placeholder:text-[rgba(0,0,0,0.3)] focus:border-[#00e5e5] focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border-b-2 border-dashed border-[rgba(0,0,0,0.15)] bg-transparent py-2 text-base text-[#1b1f24] placeholder:text-[rgba(0,0,0,0.3)] focus:border-[#00e5e5] focus:outline-none"
        />
      )}
    </div>
  );
}

/**
 * @description Create an empty PTO data structure.
 */
export function createEmptyPTO(numParagraphs: number = 2, numDetails: number = 3): PTOData {
  return {
    thesisStatement: '',
    paragraphOutlines: Array(numParagraphs)
      .fill(null)
      .map(() => ({
        ts: '',
        sd: Array(numDetails).fill(''),
      })),
    concludingStatement: '',
  };
}

/**
 * @description Convert PTO data to plain text for grading/submission.
 */
export function ptoToText(data: PTOData): string {
  const lines = [`Thesis: ${data.thesisStatement}`, ''];

  data.paragraphOutlines.forEach((para, pIndex) => {
    lines.push(`Paragraph ${pIndex + 1}`);
    lines.push(`TS: ${para.ts}`);
    para.sd.forEach((detail, dIndex) => {
      lines.push(`SD${dIndex + 1}: ${detail}`);
    });
    lines.push('');
  });

  lines.push(`Conclusion: ${data.concludingStatement}`);
  return lines.join('\n');
}

/**
 * @description Count total words in PTO data.
 */
export function countPTOWords(data: PTOData): number {
  const allText = [
    data.thesisStatement,
    ...data.paragraphOutlines.flatMap((p) => [p.ts, ...p.sd]),
    data.concludingStatement,
  ].join(' ');
  return allText.split(/\s+/).filter(Boolean).length;
}
