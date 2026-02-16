# 🚀 Resumen del Proyecto: Fitness Pro Dashboard

**Fitness Pro Dashboard** es una plataforma avanzada de gestión y análisis de salud y rendimiento físico. El proyecto combina una interfaz de usuario premium con inteligencia artificial de última generación para transformar datos biométricos en accionables estratégicos, optimizando cada aspecto de la recomposición corporal.

## 🛠️ Stack Tecnológico
*   **Frontend**: React + TypeScript + Vite.
*   **Estilos**: Vanilla CSS + Tailwind CSS con un sistema de diseño dinámico (Modo Oscuro/Claro) y animaciones fluidas (`Framer Motion`).
*   **Backend & Base de Datos**: Supabase (PostgreSQL) para persistencia de datos, autenticación y actualizaciones en tiempo real.
*   **Inteligencia Artificial**: Google Gemini (modelo `gemini-2.0-flash`) para procesamiento de lenguaje natural, análisis predictivo y generación de reportes ejecutivos.
*   **Infraestructura**: Vercel (Hosting y Serverless Functions para integración de voz externa).

---

## 💡 Características Principales

### 1. Centro de Control Biométrico (Dashboard)
El corazón de la aplicación es un panel visual de alto rendimiento:
*   **Seguimiento Integral**: Monitoreo de peso, cintura, grasa corporal, calorías, macros, pasos y sueño.
*   **Metas Inteligentes y Personalizadas**: Las metas son configurables desde el perfil. El sistema calcula automáticamente el punto de inicio real basado en el primer registro histórico.
*   **Hitos Intermedios**: Cálculo dinámico de metas intermedias (ej: 50% del progreso) para mantener la motivación.
*   **Análisis Metabólico Avanzado**: Cálculo de TDEE dinámico basado en actividad real, déficit calórico acumulado y pérdida de grasa teórica.
*   **Exportación de Datos**: Función para exportar todo el historial biométrico a formato CSV para análisis externo.

### 2. Motor de Entrenamiento (Workout Engine)
Una suite completa para el seguimiento de la actividad física:
*   **Workout Live Session**: Interfaz dedicada para el seguimiento en tiempo real de rutinas.
*   **Cronómetro de Cardio**: Timer inteligente para ejercicios cardiovasculares con alertas sonoras y estados de completitud.
*   **Gestión de Series y Repeticiones**: Registro manual de repeticiones realizadas y control de carga (kg) por serie.
*   **Rest Timer**: Temporizador automático de descanso entre series integrado en la sesión en vivo.
*   **Calendario de Entrenamiento**: Visualización histórica de la frecuencia y consistencia de los entrenamientos.

### 3. AI Fitness Coach (Integración con Gemini)
IA que actúa como un consultor de alto rendimiento:
*   **Insights Contextuales**: Detección de patrones semanales (medias) para evitar el "ruido biológico" del peso diario.
*   **Reporte Ejecutivo PRIME**: Identificación de "puntos ciegos", análisis de flujo metabólico y asignación de "Arquetipos de Usuario" (ej: "Máquina de Consistencia").
*   **Proyecciones de Metas**: Estimación de fechas para hitos específicos basadas en promedios históricos y tendencias de largo plazo.
*   **Estrategia de Recomposición**: Detección inteligente de ganancia muscular simultánea a pérdida de grasa (peso estable con reducción de cintura).

### 4. Registro Inteligente (Voice & Multi-date Log)
Fricción cero en la entrada de datos:
*   **Procesamiento de Lenguaje Natural (IA)**: Extracción de calorías, macros y gasto calórico a partir de frases naturales.
*   **Reconocimiento de Voz Nativo**: Registro directo mediante micrófono desde la interfaz web.
*   **Siri & iOS Integration**: Endpoint serverless (`api/voice-log.ts`) para registros externos mediante atajos de voz, sincronizando automáticamente con la zona horaria local.
*   **Log Multifecha**: Selector de fecha en el `QuickLog` para registrar datos en días pasados de forma retrospectiva.
*   **Lógica Aditiva Segura**: Los registros de nutrición y pasos son estrictamente aditivos para evitar sobreescrituras accidentales.

### 5. Experiencia de Usuario (UX/UI Premium)
*   **Diseño Dinámico**: Interfaz adaptable con modo oscuro/claro y estéticas premium (gradientes, glassmorphism).
*   **Onboarding Interactivo**: Tour multi-pasos (v2.0) que guía al usuario por el Log Inteligente, Visualización Pro y el Coach IA.
*   **Gamificación**: Galería de logros (Achievements) y contador de rachas (Streaks) sincronizados con el desempeño real.
*   **Biblioteca de Visualización**:
    *   **Body Heatmap**: Mapa visual de zonas de entrenamiento.
    *   **Consistency Grid**: Visualización estilo GitHub para pasos y actividad.
    *   **Weight & Waist Charts**: Gráficos avanzados con tooltips detallados y filtrado de indicadores.

---

## 📂 Estructura de Archivos Clave
*   `src/components/training/WorkoutLiveSession.tsx`: Orquestador de la sesión de entrenamiento en vivo.
*   `src/components/charts/GoalProjections.tsx`: Lógica de visualización y cálculo de proyecciones.
*   `src/lib/gemini.ts`: Ingeniería de prompts para análisis metabólico y parsing de datos.
*   `src/hooks/useFitnessData.ts`: Gestión de datos con sincronización en tiempo real vía Supabase.
*   `api/voice-log.ts`: Endpoint para integración con ecosistemas móviles externos.

---

## 🎯 Objetivo del Proyecto
Eliminar la resistencia al seguimiento manual mediante automatización inteligente, permitiendo que el usuario se enfoque exclusivamente en la ejecución mientras el sistema genera la **inteligencia estratégica** necesaria para alcanzar un estado físico de élite.
