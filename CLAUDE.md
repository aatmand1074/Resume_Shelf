# Resume Shelf — Claude Code Reference

## Purpose

Use this file as the working guide for changes to Resume Shelf. First inspect the repository, identify its actual stack and conventions, and follow them. Treat the structure below as a scalable target, not a reason to add layers the application does not need.

## Working Principles

- Make the smallest coherent change that fully addresses the request.
- Preserve existing behavior and visual conventions unless the task calls for a change.
- Trace imports, routes, configuration, and callers before moving or removing code.
- Prefer existing dependencies and shared patterns over parallel implementations.
- Keep secrets and machine-specific values out of source control.
- Explain significant structural changes and update the relevant documentation.

## Project Structure

Keep presentation, domain behavior, and infrastructure in clear boundaries. Adapt names and locations to the existing framework.

```text
src/
  app/                    # Application entry, composition, and top-level routing
  features/
    resumes/              # Resume Shelf domain and feature workflows
      components/         # Feature-specific UI
      model/              # Domain rules and feature state
      services/           # Data access and external integrations
      validation/         # Feature input and data schemas
      types/              # Feature-owned types
  shared/
    components/           # Reusable UI without feature-specific rules
    lib/                  # Reusable, framework-independent helpers
    types/                # Types shared across features
  config/                 # Validated application configuration
  assets/                 # Images, icons, and other static assets
  styles/                 # Global styles and design tokens
server/                   # Only when a server or API exists
  routes/                 # HTTP routing and request/response mapping
  services/               # Business operations and integrations
  validation/             # Request and payload schemas
  middleware/             # Shared request processing
  errors/                 # Error types and response mapping
tests/                    # Follow the repository's existing test layout
docs/                     # Architecture and workflow documentation
```

Do not force a server directory or duplicate an existing framework convention. Keep UI components focused on rendering and interaction; place business rules in feature models or services. Extract shared components and utilities only when more than one caller benefits.

## Engineering Standards

### Organization and maintenance

- Separate business logic from UI and infrastructure boundaries.
- Remove duplicate or unused code only after verifying references, dynamic usage, and generated-code conventions.
- Use consistent, descriptive names that match the language and framework conventions already in the repository.
- Keep modules cohesive and expose small, intentional interfaces.

### State and errors

- Keep short-lived interaction state near its component; put shared workflow state in the owning feature.
- Store each piece of state once. Derive display values instead of maintaining duplicate copies.
- Validate external input at system boundaries and return actionable, safe errors.
- Handle failures at the appropriate boundary; do not silently swallow exceptions or expose secrets in messages or logs.
- Keep error response shapes consistent across the application and API.

### Configuration and API

- Read environment-specific values through a configuration boundary, not scattered hardcoded values.
- Validate required configuration at startup and document safe placeholders in `.env.example`; never commit credentials.
- When an API exists, keep routes thin: validate and map requests there, delegate work to services, and return consistent responses.
- Validate request parameters, bodies, and external data before business logic uses them.
- Centralize API error mapping so clients receive stable status codes and response shapes.

### Documentation and delivery

- Keep the README accurate for prerequisites, setup, configuration, and common development commands.
- Document architecture boundaries and key user or maintenance workflows in `docs/` when they are not self-evident.
- Update documentation when a change alters setup, configuration, architecture, or a key workflow.
- Use only commands and procedures confirmed by the repository; do not invent setup steps.
- In the handoff, summarize changed areas and disclose important assumptions or outstanding limitations.

## Applied Learning

- Templates and Puppeteer ensure visual consistency; AI image generation is for one-offs only.
- Agents fail silently on wrong paths. Always verify hardcoded paths.
- New skills need validation before rendering; first runs expose data gaps.
- Google Slides autofit crashes `batchUpdate`. Set font sizes explicitly.
- Windows Developer Mode is required for symlinks (Paperclip, etc.).

Add a one-line bullet here when a failure repeats, Nate has to re-explain, or a platform/tool workaround is found. Keep each bullet under 15 words. No explanations; include only lessons that save time in future sessions.
