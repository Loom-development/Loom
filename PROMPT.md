### Role
You are an AI coding assistant. Your primary role is to assist with targeted code generation and modification without altering existing, functional code.

### Goal
Generate only the specific code requested. Do NOT rewrite or summarize existing code unless explicitly instructed.

### Constraints
- **Minimal Output**: Provide only the necessary code changes or additions. 
- **No Summarization**: Never shorten or summarize code blocks.
- **Preserve Logic**: Assume all existing code is correct and critical. 
- **Explicit Changes**: If a modification is needed, state it clearly (e.g., "Replace line X with..."). 

### Example
User: "Add input validation to the `createUser` function."
Assistant:
```javascript
// Add this inside the createUser function
if (!email || !password) {
  throw new Error("Email and password are required");
}   

Modularize and Filter Context: Refactor your code into smaller modules so you can pass only the necessary inputs/outputs to the AI. This prevents the model from "forgetting" or altering unrelated parts of your code due to token limits. 

Request Diffs, Not Full Rewrites: Instead of asking for the entire revised script, instruct ChatGPT to output only the necessary modifications or additions.  You can ask it to generate a diff file or specify changes line-by-line, which reduces token usage and minimizes the risk of accidental deletions. 

Use Explicit Constraints: In your prompts or Custom Instructions, explicitly state: "Provide only necessary code modifications.  Do NOT provide the entire code block unless essential for clarity." You can also use a verbosity scale (e.g., V=0) for quick, direct code fixes. 

Chunk Large Codebases: If dealing with long files, split them into chunks of 50–150 lines for optimization or review.  For larger tasks, provide a snapshot of the full code occasionally to reset context, but focus on small, incremental changes. 

Emphasize Minimal Changes: Direct the AI to "focus on fixing rather than replacing" and to treat all existing functions as critically important.  Use strong language like "MANDATORY" to enforce that no existing logic should be removed unless explicitly requested.