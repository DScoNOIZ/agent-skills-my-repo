/**
 * Custom Tool Template - TypeScript
 *
 * This is a starting point for creating a custom Roo tool.
 * Copy this file and modify to implement your functionality.
 */

import type { ToolContext } from 'roo';

export default async function({
  parameters,
  context
}: {
  parameters: Record<string, any>;
  context: ToolContext;
}) {
  // Access parameters (validated from SKILL.md schema)
  const { yourParam } = parameters;

  // Access logger for debugging
  context.log('Tool started with parameters:', parameters);

  // Access vault for secrets (requires VaultRead permission)
  // const apiKey = context.vault.get('YOUR_SECRET_KEY');

  // Make HTTP requests (requires Network permission)
  // const response = await context.http.request({
  //   method: 'POST',
  //   url: 'https://api.example.com/endpoint',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ data: yourParam })
  // });

  // Read files (requires FileSystemRead permission)
  // const content = await context.fs.readFile('/path/to/file.txt', 'utf8');

  // Write files (requires FileSystemWrite permission)
  // await context.fs.writeFile('/path/to/output.txt', 'result');

  // Execute shell commands (requires Shell permission)
  // const result = await context.shell.exec('ls -la');

  // Return result (will be displayed in chat)
  return {
    success: true,
    message: 'Operation completed',
    data: {
      // Your result data here
      echo: yourParam
    }
  };
};
