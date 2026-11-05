# Smart Accident Detection & Emergency Response System
## Comprehensive Project Documentation & Technical Report

**Author:** Kota Srilakshmi  
**Project Repository:** [github.com/kotasrilakshmi066-cpu/smart-accident-response](https://github.com/kotasrilakshmi066-cpu/smart-accident-response.git)  
**System Version:** 2.0 (Vercel-Ready & Cloud-Optimized)  

---

## Table of Contents
1. [Abstract](#1-abstract)
2. [Introduction & Background](#2-introduction--background)
3. [Problem Statement & Motivation](#3-problem-statement--motivation)
4. [System Objectives & Scope](#4-system-objectives--scope)
5. [System Requirements](#5-system-requirements)
   - [5.1 Functional Requirements](#51-functional-requirements)
   - [5.2 Non-Functional Requirements](#52-non-functional-requirements)
   - [5.3 Hardware & Software Specifications](#53-hardware--software-specifications)
6. [System Architecture & Design](#6-system-architecture--design)
   - [6.1 High-Level Architecture](#61-high-level-architecture)
   - [6.2 Mathematical Modeling & Algorithms](#62-mathematical-modeling--algorithms)
   - [6.3 Database Design & Entity Schema](#63-database-design--entity-schema)
7. [Implementation Details](#7-implementation-details)
   - [7.1 Backend API & Routing](#71-backend-api--routing)
   - [7.2 Frontend Geospatial Interface](#72-frontend-geospatial-interface)
   - [7.3 External Services Integration](#73-external-services-integration)
8. [Verification & Testing](#8-verification--testing)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Future Enhancements & Roadmap](#10-future-enhancements--roadmap)
11. [Conclusion](#11-conclusion)

---

## 1. Abstract
Road traffic accidents represent one of the leading global causes of preventable mortality and severe trauma. Medical evidence proves that the probability of victim survival increases exponentially if professional emergency medical care is administered during the **"Golden Hour"** (the first 60 minutes immediately following the incident). However, conventional emergency management infrastructures face severe communication bottlenecks: panicked callers cannot articulate exact coordinates, emergency call operators waste time triaging hoax or exaggerated calls, and ambulances, police units, and hospitals operate in disconnected silos without unified situational awareness.

The **Smart Accident Detection and Emergency Response System** is a full-stack, cloud-native geospatial solution that automates and accelerates the incident-to-response lifecycle. Leveraging HTML5 high-accuracy Geolocation, OpenStreetMap, Project OSRM road networks, and an intelligent credibility scoring algorithm, the system captures accident coordinates, filters spam reports, locates the nearest emergency vehicles (Ambulance, Fire, Police), finds functional hospitals in real time, and renders live animated vehicle tracking with turn-by-turn routing telemetry.

---

## 2. Introduction & Background
In high-density transit corridors and urban networks, traditional voice-based emergency reporting systems (e.g., dialing 108 or 911) suffer from:
1. **Human Cognitive Strain:** Victims or witnesses under shock often misjudge their geographic location or landmark descriptions.
2. **Resource Misallocation:** Ambulances are frequently dispatched from distant bases when nearer units might be idle or stationed closer.
3. **No Dynamic Traffic / Route Intelligence:** Traditional dispatchers lack real-time geospatial insight into road layouts, driving distances, and accurate ETAs.

This project delivers a unified web-based emergency management platform that eliminates communication overhead through one-touch automated reporting and continuous live tracing.

---

## 3. Problem Statement & Motivation
Every year, over 1.35 million people die as a result of road traffic crashes globally. Nearly 50% of fatalities occur due to post-crash delays during the first critical hour. Key technical and logistical challenges include:
* **Inaccurate Geolocation:** Voice descriptions of road sections introduce fatal response latency.
* **Lack of Credibility Triage:** Emergency services are overwhelmed with unverified calls, prank alerts, and inaccurate descriptions.
* **Absence of Real-Time Patient/Resource Visibility:** Hospitals are often caught unprepared for incoming trauma cases without prior notice or ETA updates.

The goal of this system is to replace manual communication friction with automated spatial computing, multi-criteria verification, and synchronized resource dispatch.

---

## 4. System Objectives & Scope
The key objectives of this system are:
1. **Automated Incident Logging:** Capture device GPS coordinates with high accuracy upon user report or SOS trigger.
2. **Algorithmic Verification:** Compute an automated credibility score (0–100) based on location validity, witness confirmations, description quality, and multimedia evidence.
3. **Geospatial Proximity Matching:** Compute spherical Haversine distances to rank and select the nearest available emergency responders.
4. **Live Hospital Discovery:** Connect to live OpenStreetMap Overpass APIs to discover operational medical facilities within a 10 km radius.
5. **Real-World Turn-by-Turn Routing & Telemetry:** Draw genuine road routes via OSRM GeoJSON geometry and animate vehicle transit dynamically towards the accident scene.
6. **Zero-Friction Cloud Deployment:** Support zero-native-dependency deployment on Vercel Serverless Edge infrastructure.

---

## 5. System Requirements

### 5.1 Functional Requirements
* **FR1 (Geolocation Capture):** The system must interface with browser Geolocation APIs to retrieve latitude, longitude, and accuracy metrics.
* **FR2 (SOS Emergency Trigger):** A single click must create a critical incident, compute verification, identify nearest emergency services, and initiate ambulance dispatch.
* **FR3 (Verification & Scoring):** The system must evaluate inputs and categorize reports as *Probably Real*, *Needs Verification*, or *Fake-Suspected*.
* **FR4 (Resource Allocation):** Available vehicles must be dynamically filtered, sorted by proximity, and updated to *Dispatched* upon assignment.
* **FR5 (Hospital Search):** Query external GIS infrastructure dynamically around coordinates, with automatic fallback to local records if public APIs are unavailable.
* **FR6 (Live Route Tracing):** Draw road-aligned paths and animate the dispatched vehicle marker smoothly from source to destination.

### 5.2 Non-Functional Requirements
* **Performance:** API latency must remain under 200 ms for core dispatch and distance calculations.
* **Reliability:** Built-in failover ensuring zero UI disruption when external services (Overpass, OSRM) experience rate limits or network dropouts.
* **Responsiveness:** Fluid rendering on mobile devices, tablets, and desktops using responsive CSS Grid and Leaflet mapping.
* **Portability:** Cross-platform compatibility requiring only Node.js runtime and modern web browsers.

### 5.3 Hardware & Software Specifications
* **Runtime Environment:** Node.js (v18.0.0 or higher; tested on v22.15.1)
* **Backend Framework:** Express.js (v4.21.2), CORS (v2.8.5)
* **Frontend Technologies:** HTML5, CSS3, Vanilla ES6+ JavaScript, Leaflet.js (v1.9.4)
* **Geospatial & Mapping:** OpenStreetMap Tiles, Overpass API, Project OSRM Routing API
* **Cloud Platform:** Vercel Serverless Functions & Edge CDN
* **Version Control:** Git & GitHub

---

## 6. System Architecture & Design

### 6.1 High-Level Architecture
```
+---------------------------------------------------------------+
|                       Client Browser                          |
|  - Leaflet.js Geospatial Map      - Geolocation API           |
|  - SOS Emergency Button           - Parametric Route Animator |
+-------------------------------+-------------------------------+
                                |
                                | HTTP REST / JSON
                                v
+---------------------------------------------------------------+
|                   Application Server / Vercel                 |
|  - Express.js API Gateway (api/index.js & server.js)         |
|  - Haversine Proximity Calculator                             |
|  - Verification Scoring Engine                                |
|  - Vehicle State Controller (Available -> Dispatched)         |
+---------------+-------------------------------+---------------+
                |                               |
                v                               v
+-------------------------------+   +---------------------------+
|    External Geospatial APIs   |   |   Data Management Layer   |
| - OpenStreetMap Tile Service  |   | - In-Memory / SQLite      |
| - Overpass API (Hospitals)    |   | - Accidents Registry      |
| - Project OSRM Driving Engine |   | - Emergency Fleet Store   |
+-------------------------------+   +---------------------------+
```

### 6.2 Mathematical Modeling & Algorithms

#### 1. Haversine Spherical Distance
To determine the shortest distance over the Earth's curvature between accident coordinates $(\text{lat}_1, \text{lon}_1)$ and emergency vehicle positions $(\text{lat}_2, \text{lon}_2)$:

$$\Delta\phi = \frac{(\text{lat}_2 - \text{lat}_1) \cdot \pi}{180}, \quad \Delta\lambda = \frac{(\text{lon}_2 - \text{lon}_1) \cdot \pi}{180}$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\left(\frac{\text{lat}_1 \cdot \pi}{180}\right) \cdot \cos\left(\frac{\text{lat}_2 \cdot \pi}{180}\right) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$d = 2 \cdot R \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right) \quad \text{where } R = 6371 \text{ km}$$

#### 2. Verification Scoring Model (0–100 Points)
$$S_{\text{total}} = S_{\text{GPS}} + S_{\text{desc}} + S_{\text{sev}} + S_{\text{confirm}} + S_{\text{photo}}$$

* $S_{\text{GPS}} = 30$ if coordinates are valid, finite numbers; else $0$.
* $S_{\text{desc}} = 20$ if description length $\ge 10$ characters; else $0$.
* $S_{\text{confirm}} = 20$ if bystander confirmations $\ge 1$; else $0$.
* $S_{\text{sev}} = 15$ if severity $\in \{\text{'Minor'}, \text{'Serious'}, \text{'Critical'}\}$; else $0$.
* $S_{\text{photo}} = 15$ if photo/video evidence flag is true; else $0$.

**Decision Boundary:**
* $S_{\text{total}} \ge 70$: **"Probably Real"** $\rightarrow$ Automatic dispatch sequence.
* $45 \le S_{\text{total}} < 70$: **"Needs Verification"** $\rightarrow$ Secondary police confirmation dispatched.
* $S_{\text{total}} < 45$: **"Fake-Suspected"** $\rightarrow$ Flagged for manual review.

#### 3. Parametric Waypoint Interpolation
Given an array of GeoJSON coordinates $P = [p_0, p_1, \dots, p_{n-1}]$ representing the road path:
$$idx = (n - 1) \cdot t, \quad lo = \lfloor idx \rfloor, \quad hi = \min(n - 1, lo + 1), \quad f = idx - lo$$
$$P(t) = P_{lo} + (P_{hi} - P_{lo}) \cdot f \quad \text{where } t \in [0, 1]$$

---

## 7. Implementation Details

### 7.1 Backend API & Routing
* **`GET /api/health`**: Service availability health check.
* **`GET /api/vehicles`**: Returns complete vehicle inventory.
* **`GET /api/vehicles/nearest?lat={lat}&lon={lon}&type={type}`**: Computes dynamic distance and estimated travel time ($ETA = \text{round}(d \times 3.2)$ min) for all available units.
* **`GET /api/hospitals?lat={lat}&lon={lon}&radius={radius}`**: Queries live OpenStreetMap Overpass nodes within radius, falling back to local database records on network failure.
* **`GET /api/route?fromLat={lat}&fromLon={lon}&toLat={lat}&toLon={lon}`**: Fetches actual road network geometry from OSRM, with fallback to straight-line interpolation.
* **`POST /api/accidents`**: Evaluates verification criteria, persists incident record, and returns assigned report ID with verification tier.
* **`POST /api/dispatch`**: Transitions vehicle state to *Dispatched*, logs dispatch audit record, and initiates tracking parameters.

### 7.2 Frontend Geospatial Interface
* Built with clean, accessible HTML5 and CSS3 without heavy client-side framework bloat.
* Real-time Leaflet canvas rendering custom emoji markers for high contrast and immediate readability:
  * 🔴 Accident scene
  * 🚑 Emergency Ambulance
  * 🚒 Fire Brigade unit
  * 🚓 Police patrol
  * 🏥 Medical Hospital

---

## 8. Verification & Testing
The system was subjected to comprehensive test sequences:
1. **API Integration Testing:** Executed automated script verifying all endpoints, response status codes, and JSON payload consistency.
2. **Stress & Error Resilience Testing:** Simulated network unavailability for Overpass and OSRM APIs; verified seamless fallbacks to local data without frontend crashes.
3. **GPS Fallback Validation:** Verified automated fallback to default regional coordinates when browser location permissions are denied by the client.
4. **Vercel Serverless Compatibility:** Replaced native C++ bindings (`better-sqlite3`) with a stateless in-memory adapter, eliminating `node-gyp` compile errors and read-only filesystem exceptions.

---

## 9. Deployment Architecture
* **Repository:** Hosted on GitHub with CI/CD integration.
* **Production Host:** Vercel Edge Platform.
* **Routing Specification (`vercel.json`):**
  * Rewrites all `/api/*` requests to serverless function handler `api/index.js`.
  * Serves static assets (`index.html`, `style.css`, `app.js`) directly from high-speed global CDN caches.

---

## 10. Future Enhancements & Roadmap
1. **IoT Crash Sensor Telemetry:** Direct communication with vehicle accelerometer and gyroscope microcontrollers (ESP32 / Arduino) to trigger automated crash reports upon high-G impacts.
2. **Smart Traffic Signal Preemption:** Interfacing with municipal traffic controllers to establish green corridors along the ambulance's route.
3. **Direct Hospital Bed & ICU Sync:** Bidirectional integration with hospital management systems to route trauma patients only to centers with available surgical units and matched blood types.
4. **Automated Family Notification:** Integration with Twilio / WhatsApp Business API to send real-time tracking links to victim emergency contacts.

---

## 11. Conclusion
The **Smart Accident Detection and Emergency Response System** provides a proven, scalable, and responsive solution to the critical challenges of road accident emergency management. By bridging browser geolocation, algorithmic verification, live GIS infrastructure, and automated dispatch, the platform significantly compresses response times during the Golden Hour, ultimately helping save lives.
