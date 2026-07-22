# Fundamatics Learning Engine Specification

Version: 1.0  
Status: Foundation Specification

---

## 1. Purpose

The Fundamatics Learning Engine is a reusable system for building interactive learning experiences.

The engine separates:

- educational content
- learning flow
- student interaction
- interface rendering
- lesson state

This separation allows the same engine to support different courses, subjects, and learning experiences without rewriting the core application.

Geometry A to Z is the first course built on the engine.

---

## 2. Core Principles

### 2.1 Pedagogy Before Interface

The system is organized around learning activities, not around screens or HTML elements.

A learning activity represents a meaningful pedagogical action such as:

- answering a question
- making a claim
- providing a justification
- constructing a mathematical object
- investigating a relationship
- reflecting on an idea

### 2.2 Content Is Separate from Behavior

Lesson files define what students learn.

Activity classes define how students interact.

The main application coordinates the lesson but does not contain activity-specific behavior.

### 2.3 Activities Are Reusable

Every activity should be reusable across:

- different lessons
- different courses
- different mathematical topics
- future non-mathematical subjects

### 2.4 State Is Centralized

Student responses, constructions, progress, and completion status must be stored in one central lesson state.

Activities may read and update the state, but they should not create separate independent stores.

### 2.5 The Main Application Is an Orchestrator

`app.js` is responsible for:

- loading the lesson
- requesting the current step
- rendering common lesson structure
- coordinating navigation
- connecting engines and activities
- displaying the completion screen

`app.js` should not contain the internal behavior of individual activity types.

---

## 3. System Hierarchy

The platform follows this hierarchy:

```text
Platform
└── Course
    └── Lesson
        └── Activity
            └── Component
