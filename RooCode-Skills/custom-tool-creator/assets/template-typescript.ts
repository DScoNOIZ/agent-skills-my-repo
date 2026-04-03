// Template: TypeScript Custom Tool with defineCustomTool
// Requires: npm install @roo-code/types
// Compile: npx tsc --module CommonJS --outDir dist/

import { parametersSchema as z, defineCustomTool } from "@roo-code/types";
import dotenv from "dotenv";
import path from "path";

// Load .env file from tool directory
dotenv.config({ path: path.join(__dirname, '.env') });

export default defineCustomTool({
  name: "my_tool",
  description: "Brief description what this tool does and when to use it. This is shown to AI.",

  parameters: z.object({
    param1: z.string().describe("Description of parameter 1"),
    param2: z.number().min(1).max(100).default(10).describe("Optional parameter with default"),
    mode: z.enum(['fast', 'normal', 'thorough']).default('normal').describe("Execution mode")
  }),

  async execute(args) {
    // args is type-safe and already validated by Zod

    try {
      // Main logic here
      const result = await doWork(args.param1, args.param2, args.mode);

      return `Success: ${result}`;

    } catch (error) {
      console.error('[MyTool] Error:', error);
      return `Error: ${error.message}`;
    }
  },

  // Optional lifecycle hooks (if needed)
  // validate(params) { ... },
  // postProcess(result) { ... }
});

// Private helper
async function doWork(param1: string, param2: number, mode: string): Promise<string> {
  return `processed ${param1} with mode ${mode}`;
}
