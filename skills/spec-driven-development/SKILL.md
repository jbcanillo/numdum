---
name: spec-driven-development
description: "End-to-end workflow for generating code, tests, and documentation from structured specifications. Use when a clear requirements document (Markdown, YAML, or JSON) exists and you need to scaffold implementation, unit tests, API endpoints, or configuration files. Provides templates, CLI utilities, and guidance for converting specs into working artifacts."
---

# Spec Driven Development

## Overview

This skill enables rapid project scaffolding by parsing a specification file and producing production-ready code, tests, and documentation. It follows a declarative approach: define the "what" in the spec, and the skill handles the "how".

**Typical use cases:**
- Generating service/controller code from API contracts
- Creating unit tests from feature descriptions
- Producing configuration files from environment specs
- Establishing project structure from architecture docs

## When to Use This Skill

✅ Use this skill when:
- You have a spec file (`.spec.yaml`, `.spec.json`, or Markdown)
- You need to generate multiple consistent files (code + tests + docs)
- You want to enforce project conventions automatically
- You are starting a new module or microservice from a contract

❌ Avoid this skill when:
- Only a single file needs writing (too much overhead)
- The spec is incomplete or ambiguous
- Manual tweaks outweigh automation benefits

## Input Specification Format

The skill accepts YAML, JSON, or Markdown specs. A minimal spec includes:

```yaml
# Example: user-service.spec.yaml
name: user-service
type: rest-api
language: typescript
features:
  - name: createUser
    method: POST
    path: /users
    request:
      email: string
      password: string
    response:
      id: uuid
      email: string
      createdAt: datetime
  - name: getUser
    method: GET
    path: /users/:id
    response: user
tests:
  unit: true
  integration: true
```

## CLI Commands

### `process-spec`

Parses a spec file and generates the requested outputs.

**Options:**
- `--spec PATH` – Path to the spec file (required)
- `--out DIR` – Output directory (default: current directory)
- `--templates DIR` – Custom template directory
- `--skip-existing` – Do not overwrite existing files
- `--dry-run` – Preview files without writing

**Example:**
```
process-spec --spec user-service.spec.yaml --out src/
```

### `list-templates`

Shows available templates for the given spec type.

```
list-templates --type rest-api
```

## Workflow

1. Write a spec file (see example above)
2. Run `process-spec` with appropriate flags
3. Review generated files
4. Implement custom business logic in the generated stubs
5. Add additional tests as needed

## Bundled Resources

### scripts/

- `generate.py` – Main entry point for `process-spec` command
- `templates/` – Jinja2 templates for various languages/frameworks

### references/

- `spec-schema.yaml` – JSON Schema for spec validation
- `template-guide.md` – How to customize templates

## Customization

You can extend the skill by:
- Adding new templates in `scripts/templates/`
- Modifying the spec schema in `references/spec-schema.yaml`
- Overriding default templates with `--templates` flag

## Integration with Other Skills

- Use with **pr-review** to validate generated code before committing
- Use with **git** to automatically commit generated scaffolding
