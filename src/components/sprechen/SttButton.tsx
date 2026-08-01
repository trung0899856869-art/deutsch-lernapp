"use client";

import { useState, useRef } from "react";

interface Props {
  onResult: (transcript: string) => void;
  lang?: string;
}

export function SttButton({ onResult, lang = "de-DE" }: Props) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  function toggle() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SR) {
      alert("Spracherkennung wird in diesem Browser nicht unterstützt (Chrome/Edge empfohlen).");
      return;
    }

    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        listening
          ? "bg-red-500 text-white hover:bg-red-600 animate-pulse"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      🎙️ {listening ? "Aufnahme läuft..." : "Sprechen"}
    </button>
  );
}
