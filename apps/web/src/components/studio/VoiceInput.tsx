"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

// Type declaration for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export function VoiceInput({ onTranscript, disabled = false }: VoiceInputProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const windowObj = window as unknown as IWindow;
      const SpeechRecognition =
        windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const startRecording = () => {
    setErrorMessage(null);
    setInterimText("");

    if (typeof window === "undefined") return;
    const windowObj = window as unknown as IWindow;
    const SpeechRecognition =
      windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(t.voice.speechNotSupported);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTrans = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (finalTrans) {
          onTranscript(finalTrans);
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setErrorMessage(t.voice.micPermissionDenied);
        } else if (event.error !== "no-speech") {
          setErrorMessage(`Speech recognition error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimText("");
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setErrorMessage("Could not initialize microphone.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setInterimText("");
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled || !isSupported}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            isRecording
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse shadow-md shadow-rose-500/20"
              : "bg-[#160F2E] text-[#9286C7] hover:text-white border border-[#1F1538] hover:border-[#8B20F5]/50"
          } disabled:opacity-40 disabled:cursor-not-allowed`}
          title={
            !isSupported
              ? t.voice.speechNotSupported
              : isRecording
              ? t.voice.stopRecording
              : t.voice.startRecording
          }
        >
          {isRecording ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <MicOff className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.voice.stopRecording}</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-[#A855F7]" />
              <span>{t.voice.startRecording}</span>
            </>
          )}
        </button>

        {isRecording && (
          <span className="text-[11px] text-[#A855F7] animate-pulse">
            {t.voice.listening}
          </span>
        )}
      </div>

      {/* Interim live speech feedback */}
      {isRecording && interimText && (
        <div className="text-xs italic bg-[#080613]/80 p-2.5 rounded-xl border border-[#8B20F5]/40 text-[#A855F7] animate-fadeIn">
          &ldquo;{interimText}&rdquo;
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-center space-x-1.5 text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
