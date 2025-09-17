# Publishing to Cloud Platforms

## 1. **Heroku:**
```bash
# Create Procfile
echo "web: cd server && npm start" > Procfile
echo "mcp: cd mcp-server && npm start" >> Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

## 2. **Railway:**
```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run dev",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 3. **Vercel (for frontend + API):**
```json
{
  "functions": {
    "server/index.js": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/index.js"
    }
  ]
}
```

## 4. **AWS/Google Cloud/Azure:**
- Use container services (ECS, Cloud Run, Container Instances)
- Deploy with Kubernetes
- Use serverless functions for API endpoints

## 5. **DigitalOcean App Platform:**
```yaml
name: simple-checklist-mcp
services:
- name: api
  source_dir: /server
  github:
    repo: your-username/simple-checklist-mcp
    branch: main
  run_command: npm start
  http_port: 8355
- name: mcp
  source_dir: /mcp-server
  run_command: npm start
```

## Benefits:
- Always available hosted solution
- Automatic scaling and updates
- Professional deployment pipeline
- Custom domain and SSL
