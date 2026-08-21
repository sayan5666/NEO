import React, { useState, useEffect, useRef } from 'react';

/**
 * VoiceInteraction Component
 * Provides optional voice input (SpeechRecognition) and optional voice playback (speechSynthesis).
 * Falls back silently to text if unsupported or permissions are denied.
 */
export const VoiceInteraction = ({
  onTranscriptUpdate,
  currentQuestionText,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && onTranscriptUpdate) {
          onTranscriptUpdate(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[VoiceInteraction] SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Falling back to text typing.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('[VoiceInteraction] Failed to initialize speech recognition:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [onTranscriptUpdate]);

  const toggleListening = () => {
    if (!recognitionRef.current || disabled) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn(err);
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('[VoiceInteraction] Error starting recognition:', err);
      }
    }
  };

  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window) || !currentQuestionText) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = currentQuestionText.replace(/###|\*\*|`|_/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Speech-to-Text Input Toggle */}
      {isSupported ? (
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 border-[3px] border-on-surface font-mono text-xs font-bold transition-all cursor-pointer neo-shadow ${
            isListening
              ? 'bg-secondary text-on-secondary animate-pulse'
              : 'bg-surface-container-lowest text-on-surface hover:bg-primary-container'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={isListening ? 'Click to stop voice dictation' : 'Click to dictate answer with your voice'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isListening ? 'mic' : 'mic_none'}
          </span>
          <span>{isListening ? 'RECORDING... (SPEAK NOW)' : 'VOICE_DICTATE'}</span>
          {isListening && (
            <span className="flex gap-0.5 items-center">
              <span className="w-1.5 h-3 bg-on-secondary animate-bounce"></span>
              <span className="w-1.5 h-4 bg-on-secondary animate-bounce delay-100"></span>
              <span className="w-1.5 h-2 bg-on-secondary animate-bounce delay-200"></span>
            </span>
          )}
        </button>
      ) : (
        <span
          className="font-mono text-xs text-on-surface-variant/70 border border-on-surface/30 px-2 py-1 bg-surface-container"
          title="Voice input is not supported in this browser environment. Standard keyboard input active."
        >
          VOICE: TEXT_FALLBACK
        </span>
      )}

      {/* Text-to-Speech Output Button */}
      {'speechSynthesis' in window && currentQuestionText && (
        <button
          type="button"
          onClick={handleSpeakQuestion}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-[3px] border-on-surface font-mono text-xs font-bold transition-colors cursor-pointer neo-shadow ${
            isSpeaking
              ? 'bg-tertiary text-on-tertiary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-tertiary-container'
          }`}
          title={isSpeaking ? 'Stop speaking question' : 'Read question aloud'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSpeaking ? 'volume_off' : 'volume_up'}
          </span>
          <span>{isSpeaking ? 'STOP_AUDIO' : 'READ_ALOUD'}</span>
        </button>
      )}

      {errorMessage && (
        <span className="font-mono text-xs text-error font-bold block w-full mt-1">
          {errorMessage}
        </span>
      )}
    </div>
  );
};
