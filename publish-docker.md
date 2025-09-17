# Publishing to Docker Hub

## Docker Publishing Steps:

1. **Build the image:**
```bash
docker build -f Dockerfile.mcp -t your-username/simple-checklist-mcp:latest .
```

2. **Test locally:**
```bash
docker run -p 8355:8355 -p 3001:3001 your-username/simple-checklist-mcp:latest
```

3. **Login to Docker Hub:**
```bash
docker login
```

4. **Push to Docker Hub:**
```bash
docker push your-username/simple-checklist-mcp:latest
docker push your-username/simple-checklist-mcp:v1.0.0
```

5. **Users can run with:**
```bash
docker run -d -p 8355:8355 -p 3001:3001 \
  --name simple-checklist-mcp \
  your-username/simple-checklist-mcp:latest
```

## Docker Compose for users:
```yaml
version: '3.8'
services:
  simple-checklist-mcp:
    image: your-username/simple-checklist-mcp:latest
    ports:
      - "8355:8355"
      - "3001:3001"
    volumes:
      - checklist_data:/app/data
    restart: unless-stopped

volumes:
  checklist_data:
```
