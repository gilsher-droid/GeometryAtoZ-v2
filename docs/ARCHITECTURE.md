# Fundamatics Learning Engine
## Architecture

The platform follows this structure:

Course

↓

Lesson

↓

Activity

↓

Component

## Current Core Components

- Lesson Engine
- Interaction Engine
- Response Box
- Progress Bar
- Lesson Navigation

## Planned Components

- Activity Engine
- SVG Engine
- Geometry Engine
- Construction Canvas
- Multiple Choice
- Hint Box
- Feedback Engine
- Assessment Engine
- Teacher Dashboard

## Main Principle

Each component should be reusable and independent.

The lesson data describes what should appear.

The engine decides how to display and manage it.

The app file coordinates the lesson but should not contain all component logic.
