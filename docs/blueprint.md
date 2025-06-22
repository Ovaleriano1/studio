# **App Name**: ProMaintain

## Core Features:

- User Authentication & Roles: Role-Based User Authentication using Firebase Auth (Email/Password) with custom claims for 'Admin' and 'Technician' roles.
- Offline-First Forms: Offline-First Forms: Enable technicians to fill out forms (Maintenance Visit, Repair Visit, Inspection Report, Work Order) even without internet connectivity by persisting the data locally using Firestore persistence. Includes synchronization of data when the connection resumes.
- PDF Export: PDF Export: Generate PDF documents from the filled forms and store them locally using Android's MediaStore for offline access.
- Firestore Sync: Data Synchronization: Use Firestore writeBatch() to queue offline operations and sync them to Firestore when the device reconnects to the internet.
- Form Suggestions: AI-Powered Form Suggestions: Suggest the most relevant form based on the technician's location and equipment model using a generative AI tool. The model has reasoning capabilities to consider which type of information can influence form suggestions.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) for a professional and reliable feel, inspired by machinery and engineering.
- Background color: Light gray (#F5F5F5) to ensure clarity and readability in various lighting conditions.
- Accent color: Soft Green (#8BC34A) as an accent color to indicate success and highlight interactive elements.
- Body and headline font: 'PT Sans', a modern humanist sans-serif for readability.
- Code font: 'Source Code Pro' for displaying any code snippets or technical data.
- Use clear and recognizable icons to represent form types and actions.
- Maintain a clean and structured layout to facilitate ease of use, especially in field conditions.