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
*   **Seguimiento Multi-Variable**: Monitoreo de peso, perímetro de cintura, grasa corporal, calorías, macros (proteínas/carbos/grasas), pasos y sueño.
*   **Análisis Metabólico**: Cálculo automático de TDEE, déficit acumulado y pérdida de grasa teórica basada en el balance calórico real.
*   **Visualización Avanzada**: Incluye gráficos de correlación (ej: Pasos vs. Sueño), mapas de calor de consistencia, galería de logros y proyecciones de metas.

### 2. AI Fitness Coach (Integración con Gemini)
La plataforma utiliza IA para actuar como un consultor de alto rendimiento:
*   **Insights Dinámicos**: Analiza tendencias de los últimos 30 días para detectar patrones y sugerir acciones concretas (misiones).
*   **Reporte Ejecutivo**: Genera reportes profundos que identifican "puntos ciegos", analizan el estado metabólico y asignan un "Arquetipo de Usuario".
*   **Proyecciones de Metas**: Calcula fechas estimadas para hitos específicos como alcanzar un 12% de grasa corporal o marcar abdominales.

### 3. Registro Inteligente (Voice & Quick Log)
Optimización del flujo de entrada de datos:
*   **Procesamiento de Lenguaje Natural**: Los usuarios pueden registrar datos mediante texto o voz (ej: *"Comí una pizza y corrí 45 minutos"*). La IA extrae calorías, macros y estima el gasto calórico del ejercicio.
*   **Lógica de Fusión (Add vs Set)**: Permite agregar datos de forma incremental o corregir errores previos ("modo corrección").
*   **Integración Digital**: Soporte para Siri a través de una función serverless (`api/voice-log.ts`), permitiendo el registro sin manos.

### 4. Gestión de Datos y UX
*   **Exportación**: Funcionalidad para descargar todo el historial en formato CSV.
*   **Personalización**: Perfil de usuario dinámico que ajusta cálculos según edad, altura, sexo y zona horaria (Chile).
*   **Gamificación**: Contadores de rachas (Streaks) para objetivos de calorías, proteínas y pasos diarios.

---

## 📂 Estructura de Archivos Clave
*   `src/lib/gemini.ts`: Lógica de comunicación con el LLM y prompts de ingeniería.
*   `src/lib/voiceService.ts`: Servicio de orquestación para el procesamiento de logs de voz.
*   `api/voice-log.ts`: Endpoint para integraciones externas (Vercel).
*   `src/components/charts/`: Biblioteca de visualizaciones personalizadas.
*   `src/hooks/useFitnessData.ts`: Hook central para la sincronización de datos en tiempo real con Supabase.

---

## 🎯 Objetivo del Proyecto
El sistema no solo registra datos, sino que busca **eliminar la fricción del seguimiento manual** y proporcionar una **capa de inteligencia estratégica** para alcanzar objetivos estéticos y de salud de forma eficiente.
