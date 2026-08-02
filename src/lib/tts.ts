export function speakGerman(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "de-DE";
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

// Speak multiple texts in sequence, chaining via onend events
export function speakSequence(texts: string[]): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const queue = texts.filter(Boolean);
  function speakNext(i: number) {
    if (i >= queue.length) return;
    const utt = new SpeechSynthesisUtterance(queue[i]);
    utt.lang = "de-DE";
    utt.rate = 0.85;
    utt.onend = () => speakNext(i + 1);
    window.speechSynthesis.speak(utt);
  }
  speakNext(0);
}
