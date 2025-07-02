
# Documentación Técnica: CAMOSAPPTEC

**Versión del Documento:** 1.0
**Fecha:** 2024-08-06

---

## 1. PROPÓSITO

El propósito de **CAMOSAPPTEC** es proporcionar una solución digital integral para la gestión de servicios de mantenimiento y reparación de maquinaria pesada. La aplicación está diseñada para optimizar los flujos de trabajo de los técnicos de campo y supervisores, permitiendo la creación, gestión y consulta de reportes de servicio, visitas programadas y diagnósticos asistidos por Inteligencia Artificial, centralizando así la información y mejorando la eficiencia operativa.

---

## 2. ALCANCE

El alcance de la aplicación abarca las siguientes funcionalidades:

*   **Gestión de Formularios:** Creación y envío de diversos tipos de reportes, incluyendo mantenimiento, inspección, reparación, órdenes de trabajo, visitas programadas y más.
*   **Dashboard Principal:** Visualización de un resumen de actividades recientes, sugerencias de formularios por IA y un cronómetro para el control de horas de trabajo.
*   **Visualización de Reportes:** Un módulo centralizado para ver, filtrar, buscar y gestionar todos los reportes generados. Permite la edición y eliminación de reportes según los permisos del usuario.
*   **Calendario de Actividades:** Muestra eventos importantes como visitas programadas y fechas de próximos servicios en una interfaz de calendario interactiva.
*   **Asistente de Diagnóstico con IA:** Una herramienta que utiliza Inteligencia Artificial (Genkit con modelos Gemini) para ayudar a los técnicos a diagnosticar problemas en la maquinaria basándose en descripciones y modelos de equipo.
*   **Gestión de Perfiles de Usuario:** Permite a los usuarios ver y editar su información de perfil. Los administradores pueden crear nuevos usuarios.
*   **Sistema de Roles y Permisos:** La aplicación define varios roles de usuario (Administrador, Superusuario, Supervisor, Técnico) que restringen el acceso a ciertas funcionalidades, como la edición de reportes o la visualización de analíticas.

**Fuera del Alcance (Limitaciones Actuales):**

*   La aplicación utiliza un almacenamiento de datos en memoria, lo que significa que los datos se pierden al reiniciar el servidor. No está conectada a una base de datos persistente.
*   Las notificaciones por correo electrónico son simuladas (se muestran en la consola del servidor) y no se envían correos reales.

---

## 3. DOCUMENTOS DE REFERENCIA

*   Este documento es la referencia principal para la arquitectura y diseño de la aplicación.
*   Documentación oficial de Next.js: [https://nextjs.org/docs](https://nextjs.org/docs)
*   Documentación oficial de ShadCN UI: [https://ui.shadcn.com/](https://ui.shadcn.com/)
*   Documentación oficial de Tailwind CSS: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
*   Documentación oficial de Genkit: [https://firebase.google.com/docs/genkit](https://firebase.google.com/docs/genkit)

---

## 4. DEFINICIONES IMPORTANTES

### 4.1 MARCO TEÓRICO

*   **Next.js (App Router):** Framework de React que utiliza una arquitectura de enrutamiento basada en directorios. Permite el uso de Componentes de Servidor para renderizar la UI en el servidor, mejorando el rendimiento.
*   **React:** Biblioteca de JavaScript para construir interfaces de usuario interactivas basadas en componentes.
*   **Server Actions:** Funciones de Next.js que se ejecutan en el servidor y pueden ser llamadas directamente desde los componentes del cliente, facilitando las mutaciones de datos de forma segura.
*   **Genkit y Gemini:** Genkit es un framework de Google para desarrollar aplicaciones de IA. La aplicación lo utiliza para interactuar con los modelos de lenguaje de Google (Gemini) y potenciar funciones como el diagnóstico y la sugerencia de formularios.
*   **Tailwind CSS:** Framework de CSS "utility-first" que agiliza el diseño de interfaces aplicando clases directamente en el markup HTML.

### 4.2 CONCEPTOS GENERALES

*   **Reporte:** Objeto de datos que representa cualquier formulario enviado en la aplicación (ej. un reporte de mantenimiento, una orden de trabajo).
*   **Flujo de Genkit:** Una función definida con Genkit que encapsula una lógica de IA, como una llamada a un modelo de lenguaje.
*   **Componente de Servidor (Server Component):** Un componente de React que se renderiza exclusivamente en el servidor. No tiene estado interactivo y ayuda a reducir el JavaScript enviado al navegador.

### 4.3 PROCESOS DE ENTRADA Y SALIDA

*   **Creación de Reportes:**
    *   **Entrada:** El usuario llena un formulario en la interfaz web.
    *   **Proceso:** Al enviar, se invoca una Server Action (`save...Report`). Esta función valida los datos, crea un nuevo objeto de reporte con un ID y una fecha de creación, y lo añade al arreglo de datos en memoria.
    *   **Salida:** La acción devuelve el ID del nuevo reporte. La interfaz se actualiza (revalida) para mostrar los datos más recientes.
*   **Asistente de Diagnóstico (IA):**
    *   **Entrada:** El técnico introduce el modelo del equipo y una descripción del problema.
    *   **Proceso:** Se llama al flujo de Genkit `troubleshootEquipmentFlow`. Este flujo envía la información de entrada al modelo Gemini de Google, solicitando una respuesta estructurada (causas, pasos, partes).
    *   **Salida:** El flujo devuelve un objeto JSON estructurado con el diagnóstico, que se muestra en la interfaz.

---

## 5. DESCRIPCIÓN DE MÓDULOS

*   **Dashboard (`/`):** Pantalla de inicio que muestra un resumen de los reportes más recientes, un cronómetro para control de horas y la herramienta de sugerencia de formularios con IA.
*   **Reportes (`/reports`):** Módulo para visualizar, filtrar y buscar todos los reportes del sistema. Permite ver detalles y, con los permisos adecuados, editar o eliminar reportes.
*   **Formularios (`/forms/*`):** Conjunto de páginas, cada una con un formulario específico para la entrada de datos (Mantenimiento, Inspección, etc.).
*   **Calendario (`/calendar`):** Muestra eventos (como visitas programadas) en una vista de calendario mensual y diaria. Permite programar nuevas visitas.
*   **Asistente de Diagnóstico (`/troubleshoot`):** Interfaz para interactuar con el asistente de IA y obtener guías de solución de problemas.
*   **Gestión de Estados (`/status`):** Panel para que supervisores y administradores actualicen el estado de los reportes (Pendiente, En Progreso, etc.).
*   **Análisis Gráfico (`/analytics`):** Presenta gráficos y visualizaciones de datos sobre los reportes, como cantidad por tipo, por técnico o por estado.
*   **Perfil de Usuario (`/profile`):** Página donde el usuario puede ver y modificar su información personal.
*   **Configuración (`/settings`):** Módulo exclusivo para administradores que permite crear nuevos usuarios y gestionar configuraciones de la aplicación.
*   **Autenticación (`/login`):** Página de inicio de sesión.

---

## 6. DICCIONARIO DE DATOS

La aplicación actualmente **no utiliza una base de datos tradicional**. En su lugar, simula una base de datos mediante un arreglo de objetos en memoria ubicado en `src/app/actions.ts`. Este almacenamiento es volátil.

### 6.1 MODELO ENTIDAD-RELACIÓN

El modelo es simple y se centra en una entidad principal: **Reporte**.

*   **Reporte:** Contiene todos los campos de los diferentes formularios. Un reporte está asociado a un **Usuario** (Técnico, Inspector, etc.) a través de campos como `technicianName`, `submittedBy`, etc.

### 6.2 DISTRIBUCIÓN FÍSICA Y LÓGICA DE BASE DE DATOS

*   **Lógica:** Los datos se gestionan como una colección de objetos `Reporte`.
*   **Física:** Los datos residen en la memoria RAM del servidor donde se ejecuta la aplicación (variable `reports` en `src/app/actions.ts`). No hay persistencia física.

### 6.3 TABLAS Y VISTAS

*   **Tabla `reports` (simulada):** Es el arreglo en memoria que contiene todos los reportes. Los campos son una unión de todos los posibles campos de todos los formularios. No existen vistas de base de datos.

### 6.4 TRIGGERS

No se utilizan triggers de base de datos.

### 6.5 RESTRICCIONES ESPECIALES

Existen restricciones implementadas a nivel de la lógica de la aplicación:

*   No se puede editar o eliminar un reporte cuyo estado sea "Completado" o "Cancelado".
*   No se puede iniciar el temporizador de control de horas para un reporte que ya esté "Completado" o "Cancelado".

### 6.6 FUNCIONES DE USUARIO, STORED PROCEDURES Y PAQUETES

No se utilizan. Las **Server Actions** en `src/app/actions.ts` (ej. `updateReport`, `saveMaintenanceReport`) cumplen una función análoga a los procedimientos almacenados.

### 6.7 TAREAS PROGRAMADAS

No existen tareas programadas (cron jobs).

### 6.8 DATA TRANSFORMATION SERVICES (DTS)

No se utilizan.

---

## 7. POLÍTICAS DE RESPALDO

### 7.1 ARCHIVOS

El código fuente de la aplicación debe ser gestionado a través de un sistema de control de versiones como **Git**, con repositorios alojados en servicios como GitHub, GitLab o Bitbucket para su respaldo y versionado.

### 7.2 BASE DE DATOS

**No existe una política de respaldo de base de datos** porque los datos son volátiles y residen en memoria. **Recomendación Crítica:** Es imperativo migrar el almacenamiento de datos a una solución persistente y escalable como **Cloud Firestore** o **PostgreSQL**, y configurar políticas de respaldo automáticas y periódicas en dicha plataforma.

---

## 8. DESCRIPCIÓN DE INTERFACES CON OTROS SISTEMAS

La aplicación se integra con los siguientes sistemas externos:

*   **Google AI Platform:** A través de Genkit, la aplicación se comunica con las APIs de los modelos Gemini para potenciar las funcionalidades de Inteligencia Artificial.
*   **Firebase Authentication:** Se utiliza para la autenticación y gestión de las credenciales de los usuarios.

---

## 9. INSTALACIÓN Y CONFIGURACIÓN

### 9.1 REQUISITOS GENERALES PRE-INSTALACIÓN

*   Node.js (versión 20 o superior recomendada).
*   Gestor de paquetes `npm` (incluido con Node.js).
*   Credenciales de un proyecto de Firebase con Authentication y Google AI habilitados.

### 9.2 DETALLES DEL PROCESO DE INSTALACIÓN

1.  Clonar el repositorio de código.
2.  Instalar las dependencias del proyecto: `npm install`
3.  Iniciar el servidor de desarrollo: `npm run dev`
4.  La aplicación estará disponible en `http://localhost:9002`.

### 9.3 DETALLES DE CONFIGURACIÓN DE LA APLICACIÓN

#### a. Variables de ambiente
El archivo `.env` en la raíz del proyecto debe contener las credenciales de Firebase:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

#### b. Parámetros de aplicaciones
Configuraciones específicas de Next.js se encuentran en `next.config.js`.

#### c. Archivos de configuración
*   `tailwind.config.ts`: Configuración de estilos de Tailwind CSS.
*   `tsconfig.json`: Configuración del compilador de TypeScript.
*   `components.json`: Configuración de la biblioteca de componentes ShadCN UI.
*   `apphosting.yaml`: Configuración para el despliegue en Firebase App Hosting.

#### d. Archivos de bitácora
Los logs de la aplicación se muestran en la consola donde se ejecuta el servidor de Next.js. En producción, los logs son gestionados por el servicio de hosting (Firebase App Hosting).

#### e. Tareas programadas
No hay tareas programadas.

#### f. Lista de contactos técnicos.
*   **Administrador del Sistema:** Oscar Hernandez (ohernandez@camosa.com)
*   **Supervisor de Desarrollo:** Kevin Godoy (kgodoy@camosa.com)

---

## 10. DISEÑO DE LA ARQUITECTURA FÍSICA

La aplicación está diseñada para ser desplegada en **Firebase App Hosting**, una plataforma de hosting serverless.

*   **Cliente (Navegador):** Renderiza la interfaz de usuario construida con React y componentes de ShadCN UI.
*   **Servidor (Firebase App Hosting):** Ejecuta el servidor de Next.js. Se encarga de:
    *   Renderizar los Componentes de Servidor.
    *   Ejecutar las Server Actions para la lógica de negocio.
    *   Gestionar el almacenamiento de datos en memoria (en el estado actual).
    *   Comunicarse con los servicios de Google (Firebase Auth, Google AI).

La arquitectura es serverless, lo que significa que la infraestructura subyacente (servidores, escalado) es gestionada automáticamente por Google Cloud.

---

## 11. PROCESOS DE CONTINUIDAD Y CONTINGENCIA

*   **Continuidad:** Firebase App Hosting proporciona alta disponibilidad y escalado automático, lo que garantiza la continuidad del servicio ante picos de tráfico.
*   **Contingencia:**
    *   **Punto Crítico de Fallo:** El principal riesgo es la **pérdida de datos** debido al almacenamiento en memoria. El plan de contingencia es migrar a una base de datos persistente como Firestore.
    *   **Recuperación del Servicio:** En caso de un fallo en el despliegue, Firebase App Hosting permite revertir a una versión anterior de la aplicación de manera rápida.

---

## 12. DESCRIPCIÓN DE USUARIOS

### 12.1 USUARIOS DE BASE DE DATOS

No existen usuarios de base de datos directos. El acceso a los datos está mediado por la lógica de la aplicación (Server Actions).

### 12.2 USUARIOS DE SISTEMA OPERATIVO

La aplicación se ejecuta en el entorno de Firebase App Hosting bajo una cuenta de servicio gestionada por Google Cloud, sin acceso directo de usuarios al sistema operativo.

### 12.3 USUARIOS DE APLICACIONES

Los perfiles de usuario y sus roles se gestionan en `src/context/user-profile-context.tsx`. Los roles definidos son:

*   **Administrador (`admin`):** Acceso completo a todas las funcionalidades, incluyendo la creación de usuarios y la configuración del sistema.
*   **Superusuario (`superuser`):** Acceso a todas las funciones de gestión de reportes, incluyendo edición y eliminación.
*   **Supervisor (`supervisor`):** Puede ver todos los reportes, gestionar sus estados y acceder a las analíticas. No puede eliminar reportes ni crear usuarios.
*   **Técnico (`user-technicians`):** Rol base para los usuarios de campo. Pueden crear y ver reportes, pero tienen acceso restringido a funciones de gestión y analíticas.
```