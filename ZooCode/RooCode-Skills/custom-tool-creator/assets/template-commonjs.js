// Template: CommonJS Custom Tool for Roo Code
// Place this file in ~/.roo/tools/ or .roo/tools/

module.exports.myTool = {
  name: 'my_tool',
  description: 'Brief description what this tool does and when to use it. This is shown to AI.',

  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of parameter 1'
      },
      param2: {
        type: 'number',
        default: 10,
        minimum: 1,
        maximum: 100,
        description: 'Optional parameter with default value'
      },
      mode: {
        type: 'string',
        enum: ['fast', 'normal', 'thorough'],
        default: 'normal',
        description: 'Execution mode'
      }
    },
    required: ['param1']
  },

  async execute(params) {
    // 1. Validate required parameters
    if (!params.param1) {
      return 'Error: param1 is required';
    }

    // 2. Import dependencies (if any)
    // const fs = require('fs/promises');
    // const path = require('path');

    try {
      // 3. Main logic here
      // Example: call external API, manipulate files, run commands

      // Always use try/catch and timeouts for external operations
      const result = await doWork(params.param1, params.param2, params.mode);

      // 4. Return string (or object → JSON.stringify)
      return `Success: ${result}`;

    } catch (error) {
      // 5. Log errors for debugging
      console.error('[MyTool] Error:', error);

      // 6. Return user-friendly message (avoid stack traces in prod)
      return `Error: ${error.message}`;
    }
  }
};

// Private helper function (not exported)
async function doWork(param1, param2, mode) {
  // Your implementation
  return `processed ${param1} with mode ${mode}`;
}
