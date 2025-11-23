"use client";

import React, { useRef, useState, useEffect } from "react";

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
}

export function OtpInput({ length = 6, onComplete, error }: OtpInputProps) {
  const [codes, setCodes] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Limpar campos quando houver erro
  useEffect(() => {
    if (error) {
      setCodes(Array(length).fill(""));
      inputRefs.current[0]?.focus();
    }
  }, [error, length]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Apenas números

    const newCodes = [...codes];
    newCodes[index] = value.slice(-1); // Apenas último caractere
    setCodes(newCodes);

    // Mover para próximo campo se digitou
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar se completou
    if (newCodes.every((c) => c !== "")) {
      onComplete(newCodes.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d+$/.test(pasted)) return;

    const newCodes = pasted.split("").slice(0, length);
    const filled = [...newCodes, ...Array(length - newCodes.length).fill("")];
    setCodes(filled);

    if (filled.every((c) => c !== "")) {
      onComplete(filled.join(""));
    } else {
      const nextIndex = Math.min(newCodes.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 justify-center">
        {codes.map((code, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`Dígito ${index + 1} do código`}
            className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-500 ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
