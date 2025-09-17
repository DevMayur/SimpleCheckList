# Publishing to NPM

## Steps to publish:

1. **Prepare package.json for the MCP server:**
```bash
cd mcp-server
npm init -y
```

2. **Update package.json:**
```json
{
  "name": "@your-username/simple-checklist-mcp",
  "version": "1.0.0",
  "description": "Advanced MCP server for task and project management",
  "main": "index.js",
  "bin": {
    "simple-checklist-mcp": "./index.js"
  },
  "keywords": ["mcp", "task-management", "checklist", "anthropic", "claude"],
  "repository": "https://github.com/your-username/simple-checklist-mcp",
  "license": "MIT"
}
```

3. **Publish:**
```bash
npm login
npm publish --access public
```

4. **Users can install with:**
```bash
npm install -g @your-username/simple-checklist-mcp
```
