<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Montgomery Emergency Intelligence Trainer (MEIT)

This contains everything you need to run the MEIT app locally.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env` file by copying the `.env.example` file:
   `cp .env.example .env`
3. Set the `GEMINI_API_KEY` in the `.env` file to your Gemini API key.
4. Set the `VITE_BRIGHT_DATA_API_KEY` and `VITE_BRIGHT_DATA_DATASET_ID` in the `.env` file to your Bright Data credentials.
5. Run the app:
   `npm run dev`

---

## Project Structure

The project is organized into the following main directories:

-   **/public**: Contains static assets that are publicly accessible, such as sound files.
-   **/src**: The main source code for the application.
    -   **/components**: Reusable React components.
        -   **/onboarding**: Components related to the user tutorial.
        -   **/simulation**: Components for the core simulation experience.
        -   **/ui**: General-purpose UI elements like buttons and maps.
    -   **/data**: Static data used by the application, such as `scenarios.ts`.
    -   **/hooks**: Custom React hooks for managing complex logic.
    -   **/services**: Modules for interacting with external APIs or handling specific tasks.
    -   **/store**: State management configuration (using Zustand).
    -   **/types**: TypeScript type definitions.
-   **App.tsx**: The main application component that brings everything together.
-   **main.tsx**: The entry point of the React application.

## How it Works

The application fetches live incident data from the Montgomery Open Data ArcGIS API and displays it on a Leaflet map using the `CityMap` component. The core simulation logic is managed by the `useSimulation` hook and the `scenarioEngine` service. User interactions are handled by components in the `simulation` directory, and the overall application state is managed in `App.tsx`.
