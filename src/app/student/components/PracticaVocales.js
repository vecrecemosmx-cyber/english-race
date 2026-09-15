'use client';

import { useState, useEffect, useRef } from "react";
import { IconoBocina, IconoNota } from '@/Iconos';
import datasetP1 from '../../database_practice1.json';

export default function PracticaVocales({ userEmail }) {
  const [currentFonema, setCurrentFonema] = useState('ə'); 
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackSuccessNote, setFeedbackSuccessNote] = useState('');
  const [feedbackIsCorrect, setFeedbackIsCorrect] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.25);
  const [triggerShake, setTriggerShake] = useState(false);
  const [hoveredSoundsCount, setHoveredSoundsCount] = useState(null);
  const [isFonicExpanded, setIsFonicExpanded] = useState(false);
  const [savedFonicBlocks, setSavedFonicBlocks] = useState(0);

  const startTimeWordRef = useRef(null);     
  const startTimeQuestionRef = useRef(null); 
  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [clicsMenuContador, setClicsMenuContador] = useState(0);
  const [tiemposPreguntas, setTiemposPreguntas] = useState({});
  const [respuestasInputs, setRespuestasInputs] = useState({});
  const answerInputRef = useRef(null);

  // Rangos numéricos explícitos declarados correctamente con corchetes
  const botonesRangoFonic = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const botonesRangoFonicCorto = [3, 4, 5, 6];
  const botonesConsonantes = [1, 2, 3, 4, 5, 6, 7];
  const botonesVocales = [1, 2, 3, 4, 5];

  const mappingP1 = { "1": "ə", "2": "ɪ", "3": "ɛ", "4": "æ", "5": "ʌ" };
  const questionsTexts = [
    "1. ¿Cuántos sonidos forman la palabra?",
    "2. ¿Cuántos fonemas consonantes tiene?",
    "3. ¿Cuántos fonemas vocales tiene?",
    "4. ¿En qué sílaba está el acento?",
    "5. ¿En qué sílaba está la vocal que estamos practicando?"
  ];

  const vocalAudioFiles = { "ə": "PHONEME-DUST.mp3", "ɪ": "PHONEME-PINK.mp3", "ɛ": "PHONEME-RED.mp3", "æ": "PHONEME-SAND.mp3", "ʌ": "PHONEME-CUP.mp3" };

  const palabrasFiltradas = datasetP1.filter(item => {
    return (mappingP1[String(item.fonema_id)] || item.fonema_simbolo) === currentFonema;
  }).map(item => ({
    word: item.word, f: String(item.f), fc: String(item.fc), fv: String(item.fv), stress: String(item.stress), posVocal: String(item.posVocal)
  }));

  const currentData = palabrasFiltradas[currentWordIndex] || null;

  useEffect(() => {
    if (answerInputRef.current && currentQuestionIndex < 4) {
      answerInputRef.current.focus();
    }
  }, [currentQuestionIndex, currentWordIndex, currentFonema]);

  const changeFonemaDropdown = (e) => {
    setCurrentFonema(e.target.value);
    setCurrentWordIndex(0);
    resetEntireExercise();
  };

  const resetEntireExercise = () => {
    setCurrentQuestionIndex(0);
    setStudentAnswer('');
    setShowFeedback(false);
    setErrorMessage('');
    setHasAnsweredCorrectly(false);
    setIsFonicExpanded(false);
    setSavedFonicBlocks(0);
    setTriggerShake(false);
  };

  const handlePlayWordAudio = (e) => {
    if (e) e.preventDefault();
    if (!currentData) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = currentData.word.replace(/\(.*\)/, "").trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US';
      utterance.rate = audioSpeed;
      window.speechSynthesis.speak(utterance);

      if (!isPracticeStarted) {
        const ahora = Date.now();
        startTimeWordRef.current = ahora;
        startTimeQuestionRef.current = ahora;
        setIsPracticeStarted(true);
      }
    }
  };

  const handlePlayVocalAudio = (e) => {
    if (e) e.preventDefault();
    const fileName = vocalAudioFiles[currentFonema];
    if (fileName) {
      const vocalAudio = new Audio("/audio/" + fileName);
      vocalAudio.play().catch(err => console.log("Error .mp3 fónico:", err));
    }
  };

  const registrarMétricaPreguntaOculta = (textoRespuesta) => {
    if (!startTimeQuestionRef.current) return;
    const ahora = Date.now();
    const segundosInvertidos = Math.round((ahora - startTimeQuestionRef.current) / 1000);
    const qKey = `q${currentQuestionIndex + 1}`;
    setTiemposPreguntas(prev => ({ ...prev, [`${qKey}_tiempo`]: segundosInvertidos }));
    setRespuestasInputs(prev => ({ ...prev, [`${qKey}_input`]: String(textoRespuesta) }));
    startTimeQuestionRef.current = ahora; 
  };
