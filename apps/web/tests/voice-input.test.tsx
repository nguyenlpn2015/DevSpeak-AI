import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VoiceInput } from "@/components/studio/VoiceInput";
import { LanguageProvider } from "@/i18n/LanguageContext";

describe("VoiceInput Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders voice button with fallback tooltip when Web Speech API is absent", () => {
    // Delete any mocked SpeechRecognition
    // @ts-expect-error test cleanup
    delete window.SpeechRecognition;
    // @ts-expect-error test cleanup
    delete window.webkitSpeechRecognition;

    render(
      <LanguageProvider>
        <VoiceInput onTranscript={vi.fn()} />
      </LanguageProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("title")).toContain(
      "Speech recognition is not supported in this browser"
    );
  });

  it("starts recording and handles transcript when SpeechRecognition is available", () => {
    const mockStart = vi.fn();
    const mockStop = vi.fn();

    class MockSpeechRecognition {
      continuous = true;
      interimResults = true;
      lang = "en-US";
      onstart: (() => void) | null = null;
      onresult: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        mockStart();
        if (this.onstart) this.onstart();
      }
      stop() {
        mockStop();
        if (this.onend) this.onend();
      }
    }

    // @ts-expect-error mock window api
    window.SpeechRecognition = MockSpeechRecognition;

    const handleTranscript = vi.fn();

    render(
      <LanguageProvider>
        <VoiceInput onTranscript={handleTranscript} />
      </LanguageProvider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Stop Recording")).toBeDefined();
  });
});
