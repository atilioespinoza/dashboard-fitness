# 🚀 Resumen del Proyecto: Fitness Pro Dashboard

**Fitness Pro Dashboard** es una plataforma avanzada de gestión y análisis de salud y rendimiento físico. El proyecto combina una interfaz de usuario premium con inteligencia artificial de última generación para transformar datos biométricos en accionables estratégicos.

## 🛠️ Stack Tecnológico
*   **Frontend**: React + TypeScript + Vite.
*   **Estilos**: Tailwind CSS con un sistema de diseño dinámico (Modo Oscuro/Claro) y animaciones fluidas (`Framer Motion`).
*   **Backend & Base de Datos**: Supabase (PostgreSQL) para persistencia de datos y autenticación de usuarios.
*   **Inteligencia Artificial**: Google Gemini (modelo `gemini-3-flash-preview`) para procesamiento de lenguaje natural y análisis predictivo.
*   **Infraestructura**: Vercel (Hosting y Serverless Functions para integración de voz).

---

## 💡 Características Principales

### 1. Centro de Control Biométrico (Dashboard)
El corazón de la aplicación es un panel visual que ofrece:
*   **Seguimiento Dinámico y Personalizado**: Monitoreo de peso, cintura, grasa corporal, calorías, macros, pasos y sueño.
*   **Metas Inteligentes**: Las metas (incluyendo pasos diarios, cintura y % de grasa) son personalizables desde el perfil. El sistema calcula automáticamente el punto de inicio real basado en el primer registro histórico.
*   **Hitos Intermedios**: Cálculo dinámico de metas intermedias (50% del progreso) para mantener la motivación.
*   **Análisis Metabólico**: Cálculo de TDEE, déficit acumulado y pérdida de grasa teórica basada en el balance calórico real.

### 2. AI Fitness Coach (Integración con Gemini)
La plataforma utiliza IA para actuar como un consultor de alto rendimiento:
*   **Insights Contextuales**: Analiza tendencias para detectar patrones y sugerir acciones concretas. Incluye estados "Awaiting Data" para guiar a nuevos usuarios.
*   **Reporte Ejecutivo**: Genera reportes profundos que identifican "puntos ciegos", analizan el estado metabólico y asignan un "Arquetipo de Usuario".
*   **Proyecciones de Metas**: Calcula fechas estimadas para hitos específicos basándose en promedios históricos, no solo en tendencias de corto plazo.

### 3. Registro Inteligente (Voice & Quick Log)
Optimización total del flujo de entrada de datos:
*   **Reconocimiento de Voz Nativo**: Integración directa con la Speech API del navegador para un registro sin manos desde el dashboard.
*   **Procesamiento de Lenguaje Natural**: Extracción automática de calorías, macros y gasto calórico mediante IA a partir de frases naturales.
*   **Lógica de Datos Segura**: Implementación de lógica estrictamente aditiva para nutrición y actividad, evitando sobreescrituras accidentales.
*   **Integración Siri**: Soporte para atajos de voz externos a través de funciones serverless dedicadas.

### 4. Notificaciones Inteligentes & PWA
Extiende la utilidad de la app fuera del navegador:
*   **Experiencia PWA**: App totalmente instalable en el iPhone con iconos personalizados, eliminando la barrera del navegador.
*   **Recordatorios Contextuales**: Sistema de notificaciones locales que alerta al usuario sobre metas faltantes (ej: recordatorio de proteína a las 5 PM si el progreso es bajo).
*   **Permisos de Usuario**: Gestión granular de notificaciones desde el perfil biométrico.

### 5. Experiencia de Usuario (UX/UI)
*   **Onboarding Interactivo**: Tour multi-pasos detallado que guía al usuario por las funciones clave (Log Inteligente, Visualización Pro y Coach IA).
*   **Gamificación Pro**: Galería de logros (Achievements) y contadores de rachas totalmente sincronizados con las metas personalizadas del perfil.
*   **Personalización Localizada**: Perfil dinámico ajustado a biometría individual y huso horario específico.

---

## 📂 Estructura de Archivos Clave
*   `src/lib/gemini.ts`: Orquestación del LLM y prompts de ingeniería avanzados.
*   `src/hooks/useSpeechRecognition.ts`: Hook para gestión de entrada de voz nativa.
*   `src/hooks/useProfile.ts`: Gestión de biometría y metas personalizables.
*   `src/components/charts/`: Biblioteca de visualizaciones personalizadas y dashboards dinámicos.
*   `api/voice-log.ts`: Endpoint serverless para integraciones de voz externas (Siri/iOS).

---

## 🎯 Objetivo del Proyecto
El sistema busca **eliminar la fricción del seguimiento manual** convirtiendo registros simples en **inteligencia estratégica**, permitiendo a los usuarios alcanzar sus objetivos físicos con la precisión de un atleta profesional.
