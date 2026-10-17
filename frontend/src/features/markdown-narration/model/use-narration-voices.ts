import { useEffect, useState } from "react";

interface NarrationVoices {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
}

export function useNarrationVoices(): NarrationVoices {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    const available = "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
    setSupported(available);
    if (!available) return;
    const synthesis = window.speechSynthesis;
    const updateVoices = () => setVoices(synthesis.getVoices());
    updateVoices();
    synthesis.addEventListener("voiceschanged", updateVoices);
    return () => synthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);
  return { supported, voices };
}
