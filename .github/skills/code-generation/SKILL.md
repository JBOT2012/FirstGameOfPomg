---
name: code-generation
description: "Use when: generating code for a new feature, API, service, or UI. Prefer Java for backend implementation and only use AngularJS for frontend code when it is absolutely necessary."
---

# Code Generation

Generate code in a way that aligns with this project standard:

1. Backend code must be written in Java.
2. Use Java for APIs, services, business logic, persistence, and integration layers.
3. Only use AngularJS for frontend code when it is absolutely necessary due to the existing technology stack or explicit project requirement.
4. If a frontend is not required by the task, prefer a server-side or API-first solution without adding AngularJS.
5. Keep the implementation simple, maintainable, and aligned with Java enterprise conventions.
6. Avoid introducing frontend frameworks unless they are required or already established.

## Preferred defaults

- Java for backend services and controllers
- Spring Boot or similar Java frameworks when appropriate
- Minimal frontend implementation unless AngularJS is mandated

## Avoid

- JavaScript or TypeScript backend implementations when Java is the appropriate backend language
- New AngularJS frontends when a simpler solution is sufficient
- Unnecessary technology sprawl or framework churn
