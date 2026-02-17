import { useState, useCallback, useRef, useEffect } from 'react';

export const useSpeechRecognition = (onResult: (text: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
            setIsListening(false);
        }
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Tu navegador no soporta el reconocimiento de voz. Te recomendamos usar Chrome o Safari actualizado.');
            return;
        }

        try {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                console.log('Voice recognition started');
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    console.log('Result found:', finalTranscript);
                    onResult(finalTranscript.trim());
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    alert('Permiso de micrófono denegado. Por favor, habilita el micrófono en la configuración de tu navegador.');
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                console.log('Voice recognition ended');
                setIsListening(false);
            };

            recognition.start();
            recognitionRef.current = recognition;
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            setIsListening(false);
        }
    }, [onResult]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return {
        isListening,
        startListening,
        stopListening
    };
};
