/**
 * @fileoverview Structured editor for Single Paragraph Outline (SPO) activities.
 * Provides labeled input fields for topic sentence, supporting details, and concluding sentence.
 */

'use client';

import { useCallback } from 'react';

/** SPO data structure matching AlphaWrite schema */
export interface SPOData {
  ts: string;
  sd: string[];
  cs: string;
}

interface SPOEditorProps {
  /** Current SPO data */
  value: SPOData;
  /** Callback when data changes */
  onChange: (data: SPOData) => void;
  /** Whether the editor is in revision mode */
  isRevision?: boolean;
}

/**
 * @description Structured editor for Single Paragraph Outline activities.
 * Displays labeled fields for T.S., SD1-3, and C.S. with dashed underlines.
 */
export function SPOEditor({ value, onChange, isRevision = false }: SPOEditorProps) {
  /**
   * @description Update the topic sentence.
   */
  const handleTSChange = useCallback(
    (newValue: string) => {
      onChange({ ...value, ts: newValue });
    },
    [value, onChange]
  );

  /**
   * @description Update a supporting detail by index.
   */
  const handleSDChange = useCallback(
    (index: number, newValue: string) => {
      const newSD = [...value.sd];
      newSD[index] = newValue;
      onChange({ ...value, sd: newSD });
    },
    [value, onChange]
  );

  /**
   * @description Update the concluding sentence.
   */
  const handleCSChange = useCallback(
    (newValue: string) => {
      onChange({ ...value, cs: newValue });
    },
    [value, onChange]
  );

  return (
    <div className="space-y-5">
      {/* Topic Sentence */}
      <FieldRow
        label="T.S."
        labelFull="Topic Sentence"
        value={value.ts}
        onChange={handleTSChange}
        placeholder={isRevision ? 'Revise your topic sentence...' : 'Write your topic sentence...'}
      />

      {/* Supporting Details */}
      {value.sd.map((detail, index) => (
        <FieldRow
          key={index}
          label={`SD${index + 1}`}
          labelFull={`Supporting Detail ${index + 1}`}
          value={detail}
          onChange={(v) => handleSDChange(index, v)}
          placeholder={
            isRevision
              ? `Revise supporting detail ${index + 1}...`
              : `Write supporting detail ${index + 1}...`
          }
        />
      ))}

      {/* Concluding Sentence */}
      <FieldRow
        label="C.S."
        labelFull="Concluding Sentence"
        value={value.cs}
        onChange={handleCSChange}
        placeholder={isRevision ? 'Revise your concluding sentence...' : 'Write your concluding sentence...'}
      />
    </div>
  );
}

interface FieldRowProps {
  label: string;
  labelFull: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/**
 * @description A single labeled input field with dashed underline styling.
 */
function FieldRow({ label, labelFull, value, onChange, placeholder }: FieldRowProps) {
  return (
    <div className="group">
      {/* Label */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded bg-[rgba(0,229,229,0.1)] px-2 py-0.5 text-xs font-semibold text-[#00e5e5]">
          {label}
        </span>
        <span className="text-xs text-[rgba(0,0,0,0.4)]">{labelFull}</span>
      </div>

      {/* Input with dashed underline */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border-b-2 border-dashed border-[rgba(0,0,0,0.15)] bg-transparent py-2 text-base text-[#1b1f24] placeholder:text-[rgba(0,0,0,0.3)] focus:border-[#00e5e5] focus:outline-none"
        />
      </div>
    </div>
  );
}

/**
 * @description Create an empty SPO data structure with specified number of supporting details.
 */
export function createEmptySPO(numDetails: number = 3): SPOData {
  return {
    ts: '',
    sd: Array(numDetails).fill(''),
    cs: '',
  };
}

/**
 * @description Convert SPO data to plain text for grading/submission.
 */
export function spoToText(data: SPOData): string {
  const lines = [
    `TS: ${data.ts}`,
    ...data.sd.map((detail, i) => `SD${i + 1}: ${detail}`),
    `CS: ${data.cs}`,
  ];
  return lines.join('\n');
}

/**
 * @description Count total words in SPO data.
 */
export function countSPOWords(data: SPOData): number {
  const allText = [data.ts, ...data.sd, data.cs].join(' ');
  return allText.split(/\s+/).filter(Boolean).length;
}
