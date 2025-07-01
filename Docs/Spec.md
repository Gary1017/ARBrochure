# AR Brochure App Specification Document

## 1. Introduction

This document defines the technical specifications for an Augmented Reality (AR) application for mobile devices. The application will leverage image tracking to recognize a physical brochure and render interactive 3D animated models on the detected plane.

## 2. Project Goals

* **Brochure Interactivity Enhancement:** Enable dynamic interaction with static print media.

* **3D Model Visualization:** Display animated 3D models accurately on the brochure's planar surface.

* **Mobile AR Interaction:** Provide intuitive AR interaction on mobile platforms.

* **Cross-Platform Compatibility:** Support iOS and Android mobile devices via Web AR.

## 3. Technology Stack

* **Frontend Framework:** React.js

* **Package Manager:** Pnpm

* **Language:** TypeScript

* **Testing Tool:** Jest

* **Build Tool:** Vite

* **3D Graphics Library:** Three.js

* **AR Library:** `mind-ar-js` (for image tracking)

* **Backend:** Node.js (for static asset serving and API proxying)

* **Database Integration:** Feishu Database API (for OA system integration and performance metrics storage)

## 4. Core Features

### 4.1. AR Initialization & Tracking

* **Application Launch:** QR code scan initiates web AR application in mobile browser.

* **Camera Access:** Request and obtain camera permissions.

* **Image Target Recognition:** `mind-ar-js` will detect and track a pre-defined image target (brochure).

* **Real-time Pose Tracking:** Continuous, stable tracking of the brochure's 6-DoF pose for accurate 3D model anchoring.

* **User Guidance:** Display visual cues for camera positioning and tracking status.

### 4.2. 3D Model Rendering & Animation

* **Model Overlay:** Render pre-configured 3D animated models upon successful brochure detection.

* **Spatial Alignment:** Models will be positioned and scaled relative to the detected image target's coordinate system.

* **Animation Control:** Implement specific animations (e.g., rotation, keyframe sequences) for each 3D model.

* **Visual Fidelity:** Apply Three.js lighting and material properties for realistic model integration.

### 4.3. User Interaction (Tap-to-Interact)

Interaction is based on direct screen taps on rendered 3D models. No explicit on-screen cursor will be present.

* **Tap Event Trigger:** A screen tap event, when intersecting a 3D model, will initiate a pre-defined action.

    * **Action:** Trigger a model-specific animation or visual effect (e.g., glow, particle system, temporary scale modification).

    * **Visual Feedback:** Provide distinct visual confirmation on the tapped model post-interaction.

* **Raycasting:** A Three.js `Raycaster` will project a ray from 2D touch coordinates into the 3D scene to determine model intersection.

## 5. User Interface (UI) Elements

* **Loading Indicator:** Display during asset loading and AR engine initialization.

* **Instructional Overlays:** Provide directives for AR experience setup (e.g., "Scan brochure").

* **AR Control Elements (Minimal):**

    * **Recenter Function:** Re-align AR tracking.

    * **Information Access:** Provide basic application usage instructions.

## 6. Backend Component: Performance Metrics & OA Integration

A Node.js backend will manage anonymous user interaction data and facilitate communication with the Feishu OA system.

### 6.1. User Performance Metrics

* **Objective:** Collect and analyze user interaction patterns within the AR experience.

* **Data Schema (Anonymous):**

    * `timestamp`: Event timestamp.

    * `event_type`: Categorization of interaction (e.g., "app_launched", "model_tapped").

    * `model_id`: Identifier for the interacted 3D model (if applicable).

    * `session_id`: Unique session identifier (`crypto.randomUUID()`).

    * `user_id`: Anonymous user identifier (`crypto.randomUUID()`).

* **Data Persistence:** Feishu Database (Base) will serve as the data store.

    * **Table Structure:** A dedicated Feishu Base table (e.g., `ar_app_events`) will store events as records, with corresponding fields for each data attribute.

* **Data Ingestion:** Frontend JavaScript will transmit event data to the Node.js backend proxy. The backend will then utilize the Feishu Database API to write records to the specified Feishu Base table.

* **Reporting:** Initial data analysis will be performed directly within the Feishu Base interface, leveraging its native filtering and dashboarding capabilities.

### 6.2. Feishu Database API Integration (Dynamic Content & OA)

* **Objective:** Integrate AR application functionality with the enterprise Feishu OA system.

* **Feishu Database API:** Provides programmatic access to Feishu Base (多维表格) for CRUD operations on records, fields, and views.

* **Integration Applications:**

    * **Dynamic Content Management:** Store AR content configurations (e.g., model paths, animation triggers, tap actions) in Feishu Base for remote updates by non-technical personnel.

    * **Brochure-Specific Data:** Manage detailed product information or conditional AR behaviors within Feishu Base, linked to specific AR models.

    * **Internal Workflow Integration:** Potentially link AR interactions to Feishu-based workflows (e.g., lead capture, feedback submission), requiring Feishu user authentication for attributed data.

* **Integration Mechanism:**

    * **Backend Proxy:** A Node.js server will act as a secure intermediary between the frontend and the Feishu Database API, handling authentication (App ID, App Secret, tenant access tokens) and mitigating CORS/security concerns.

    * **Data Mapping:** Define clear mapping between Feishu Base data structures and application-specific data models.

* **Constraints:**

    * **API Rate Limits:** Adhere to Feishu API rate limits; implement caching or rate-limiting on the backend proxy.

    * **Real-time Data:** Feishu Database API is RESTful; real-time data push requires custom polling mechanisms.

    * **Security:** Implement robust authorization and data validation on the Node.js backend.

## 7. Technical Requirements

* **Performance Metrics:** Maintain $\geq 30$ FPS on target mobile devices.

* **3D Asset Optimization:** Utilize optimized GLTF/GLB models and efficient textures.

* **Responsive Design:** UI and AR rendering must adapt to diverse mobile screen resolutions and orientations.

* **Error Management:** Implement graceful error handling for camera access, tracking loss, network interruptions, and API communication failures.

* **Development Environment:** Node.js, pnpm, Vite, React, TypeScript.

* **Feishu Integration:** Establish secure backend proxy and API communication with Feishu Database.

## 8. Development Phases (High-Level)

1.  **Project Initialization:** Vite + React + TypeScript + Three.js setup.

2.  **AR Core Integration:** `mind-ar-js` setup, camera feed, and basic tracking.

3.  **3D Asset Pipeline:** Model loading, placement, and animation integration.

4.  **Interaction System:** Raycasting and tap-to-interact logic implementation.

5.  **UI Implementation:** Loading screens, guidance overlays, and control elements.

6.  **Feishu Backend Integration:** Node.js proxy development, Feishu Database API authentication, and data schema definition.

7.  **Data Ingestion & Retrieval:** Implement analytics event logging to Feishu Base and dynamic content retrieval from Feishu Base.

8.  **Optimization:** Performance tuning for mobile AR and backend API interactions.

9.  **Testing:** Comprehensive unit, integration, and end-to-end testing across target mobile devices.

## 9. Development Methodology: Test-Driven Development (TDD) with Jest

This project will adhere to a Test-Driven Development (TDD) methodology, with Jest serving as the primary unit testing framework.

### 9.1. Test-Driven Development (TDD) Overview

TDD is an iterative software development process characterized by the "Red-Green-Refactor" cycle:

1.  **Red (Test Failure):** Write a minimal unit test for a new feature, ensuring it fails due to the absence of the corresponding implementation.

2.  **Green (Code Implementation):** Implement the minimum code required to satisfy the failing test, achieving a passing state.

3.  **Refactor (Code Refinement):** Improve the code's design, readability, and efficiency while maintaining test pass rates.

This cycle ensures continuous verification and incremental development.

### 9.2. Jest's Role in TDD

Jest will facilitate the TDD workflow through its core capabilities:

* **Unit Test Execution:** Jest will execute isolated unit tests for:

    * **Frontend React Components:** Validate rendering, user interaction handling (via React Testing Library), and dynamic content display.

    * **Three.js Modules:** Verify raycasting algorithms, model loading utilities, and animation state transitions.

    * **Node.js Backend Services:** Confirm API endpoint behavior, secure Feishu API communication, and analytics data logging.

    * **Shared Utilities:** Test common helper functions.

* **Rapid Feedback:** Jest's fast execution and watch mode provide immediate feedback on code changes, critical for the TDD cycle.

* **Dependency Mocking:** Jest's mocking framework will isolate units under test by simulating external dependencies (e.g., Feishu Database API calls, `mind-ar-js` engine, Three.js rendering context), ensuring efficient and reliable tests.

* **Code Coverage Analysis:** Jest's integrated coverage reporting will monitor the extent of test coverage, promoting comprehensive testing.