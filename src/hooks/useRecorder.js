// Pieza 3 de 5: CUSTOM HOOK ENCAPSULADO PARA CAPTURA DE AUDIO NATIVO
// Guarda en: src/hooks/useRecorder.js (Longitud segura < 5500 caracteres)

import { useState, useRef } from 'react';

export function useRecorder() {
  const [grabando, setGrabando] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlobUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setGrabando(true);
    } catch (err) {
      alert("⚠️ Permiso de micrófono denegado en el sistema.");
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
      setGrabando(false);
    }
  };

  return { grabando, audioBlobUrl, iniciarGrabacion, detenerGrabacion, setAudioBlobUrl };
}
