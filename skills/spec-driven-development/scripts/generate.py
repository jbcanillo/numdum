#!/usr/bin/env python3
"""
Spec-Driven Development: Generate code from a spec file.

Usage:
  python generate.py --spec path/to/spec.yaml --out output_dir
"""

import argparse
import os
import sys
from pathlib import Path

import yaml
from jinja2 import Template

DEFAULT_TEMPLATES = {
    "rest-api": {
        "service.j2": """// Generated service for {{ name }}
export class {{ name }}Service {
  constructor() {}

  {% for feature in features %}
  async {{ feature.name }}(req: any): Promise<any> {
    // TODO: Implement {{ feature.method }} {{ feature.path }}
    throw new Error('Not implemented');
  }
  {% endfor %}
}
""",
        "test.j2": """import { {{ name }}Service } from './{{ name.lower() }}.service';

describe('{{ name }}Service', () => {
  let service: {{ name }}Service;

  beforeEach(() => {
    service = new {{ name }}Service();
  });

  {% for feature in features %}
  it('should handle {{ feature.name }}', async () => {
    // TODO: Write test for {{ feature.name }}
  });
  {% endfor %}
});
""",
        "README.j2": """# {{ name }}

Generated from spec: {{ spec_path }}

## Features

{% for feature in features %}
- **{{ feature.name }}** ({{ feature.method }} {{ feature.path }})
{% endfor %}

## Development

Implement the service methods in `src/` and write tests in `tests/`.
"""
    }
}

def load_spec(spec_path):
    with open(spec_path, 'r') as f:
        if spec_path.endswith('.json'):
            return json.load(f)
        else:
            return yaml.safe_load(f)

def ensure_dir(path):
    Path(path).mkdir(parents=True, exist_ok=True)

def render_template(template_str, context):
    return Template(template_str).render(**context)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--spec', required=True)
    parser.add_argument('--out', default='.')
    parser.add_argument('--templates', help='Custom template directory')
    args = parser.parse_args()

    spec = load_spec(args.spec)
    spec['spec_path'] = args.spec

    out_dir = Path(args.out)
    ensure_dir(str(out_dir))

    template_set = DEFAULT_TEMPLATES.get(spec.get('type', 'rest-api'))

    # Create src and tests directories
    src_dir = out_dir / 'src'
    tests_dir = out_dir / 'tests'
    ensure_dir(str(src_dir))
    ensure_dir(str(tests_dir))

    # Render templates
    rendered = {}
    for filename, tmpl in template_set.items():
        if filename.endswith('.j2'):
            out_name = filename[:-3]  # remove .j2
            content = render_template(tmpl, spec)
            if 'test' in filename:
                target_dir = tests_dir
            else:
                target_dir = src_dir if filename != 'README.j2' else out_dir
            target_path = target_dir / out_name
            with open(target_path, 'w') as f:
                f.write(content)
            rendered[str(target_path)] = content

    print(f"Generated {len(rendered)} files from {args.spec}")
    for path in rendered:
        print(f" - {path}")

if __name__ == '__main__':
    main()
