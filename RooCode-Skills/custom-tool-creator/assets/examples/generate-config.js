// ~/.roo/tools/generate-config.js
const fs = require('fs/promises');
const path = require('path');

module.exports.generateConfig = {
  name: 'generate_config',
  description: 'Generate configuration file from template. Creates boilerplate for new projects.',
  parameters: {
    type: 'object',
    properties: {
      template: {
        type: 'string',
        enum: ['express', 'react', 'fastapi', 'docker', 'github-actions'],
        description: 'Template name to generate'
      },
      projectName: {
        type: 'string',
        pattern: '^[a-zA-Z0-9_-]+$',
        description: 'Project name (used in config)'
      },
      outputDir: {
        type: 'string',
        default: '.',
        description: 'Output directory (within workspace)'
      },
      variables: {
        type: 'object',
        description: 'Additional template variables as key-value pairs'
      }
    },
    required: ['template', 'projectName']
  },
  async execute({ template, projectName, outputDir = '.', variables = {} }) {
    const templates = {
      express: `{
  "name": "${projectName}",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}`,
      docker: `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["node", "server.js"]
`,
      'github-actions': `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
`
    };

    const templateContent = templates[template];
    if (!templateContent) {
      return `Error: Unknown template "${template}". Available: ${Object.keys(templates).join(', ')}`;
    }

    // Workspace check
    const fullOutputDir = path.resolve(process.cwd(), outputDir);
    if (!fullOutputDir.startsWith(process.cwd() + path.sep)) {
      return 'Error: outputDir outside workspace';
    }

    try {
      const outputPath = path.join(fullOutputDir, template === 'express' ? 'package.json' : '.') +
                        (template === 'docker' ? 'Dockerfile' :
                         template === 'github-actions' ? '.github/workflows/ci.yml' : '');

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, templateContent, 'utf-8');

      return {
        success: true,
        file: outputPath,
        template: template,
        variablesUsed: Object.keys(variables)
      };

    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};
