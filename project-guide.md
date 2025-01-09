# Learning and Development Plan Project Guide

## 1. Project Architecture Overview

### Core Components
```
Frontend (Browser)     ↔     Docker Container     ↔     Supabase (Backend)
(HTML/CSS/JavaScript)       (Development Environment)    (Database & Auth)
```

### Key Files and Their Purposes
- `frontend/`
  - `index.html`: Main application page
  - `css/styles.css`: Visual styling
  - `js/main.js`: Application logic
  - `package.json`: Project dependencies
  - `Dockerfile`: Frontend container setup
- `backend/`
  - `Dockerfile`: Backend container setup (minimal due to Supabase)
- `docker-compose.yml`: Container orchestration

## 2. Development Workflow

### Starting Development
1. Start Docker Desktop
2. Start the containers:
   ```bash
   docker compose up --build
   ```
3. Leave this terminal running
4. Open new terminal for additional commands

### Stopping Development
1. In the Docker terminal: Press Ctrl + C
2. To fully remove containers:
   ```bash
   docker compose down
   ```

### Database (Supabase)
- Always running (cloud-based)
- No need to start/stop
- Access via Supabase dashboard for:
  - Table management
  - User administration
  - API settings

## 3. Development Tasks and Cursor AI Prompts

### Authentication Setup
```
Prompt: "Help me implement user authentication in frontend/js/main.js using Supabase auth with the following features:
- Sign up
- Login
- Password reset
- Admin role check"
```

### Database Operations
```
Prompt: "Create functions in frontend/js/main.js to:
- Save learning plans to Supabase
- Fetch user's plans
- Update existing plans
Include error handling and loading states."
```

### Course Integration
```
Prompt: "Help me implement course recommendation features that:
- Fetch courses from external APIs
- Cache results in Supabase
- Match courses to user skills
Show me the complete implementation with error handling."
```

## 4. Common Development Tasks

### Adding New Dependencies
1. Stop Docker (Ctrl + C)
2. Add dependency:
   ```bash
   cd frontend
   npm install [package-name]
   ```
3. Rebuild containers:
   ```bash
   docker compose up --build
   ```

### Making Code Changes
1. Edit files in Cursor
2. Save changes
3. Browser auto-refreshes
4. Check Docker logs for errors

### Database Changes
1. Use Supabase dashboard
2. Run SQL in SQL Editor
3. Test changes in application

## 5. Tips and Best Practices

### Docker Tips
- Use `docker compose down` when switching branches
- Check logs in Docker Desktop for issues
- Use `--build` when changing dependencies

### Supabase Tips
- Keep track of API keys
- Test queries in Supabase dashboard first
- Use Row Level Security (RLS) policies

### Development Tips
- Use browser console for debugging
- Check network tab for API issues
- Use Cursor AI for code generation
- Keep documentation updated

## 6. Cursor AI Strategy

### Effective Prompting
1. Be specific about files and features
2. Include error handling requirements
3. Ask for complete solutions
4. Request explanations of complex parts

### Example Progression
1. Basic setup: "Set up file structure and dependencies"
2. Auth: "Implement authentication features"
3. Core features: "Create learning plan management"
4. Integration: "Add course recommendations"
5. Admin: "Implement admin features"

### When Stuck
1. Ask for explanation: "Explain how [feature] works"
2. Request examples: "Show example of [pattern]"
3. Debug help: "Help debug this error: [error]"

## 7. Common Issues and Solutions

### Docker Issues
- Container won't start: Check ports, run `docker compose down`
- Changes not showing: Rebuild with `--build`
- Port conflicts: Change ports in docker-compose.yml

### Supabase Issues
- Connection failed: Check API keys
- Permissions: Review RLS policies
- Data not saving: Check console for errors

### Frontend Issues
- Page not updating: Check file paths
- JS errors: Check browser console
- Style issues: Inspect elements

## 8. Next Steps

1. Complete authentication system
2. Implement core learning plan features
3. Add course recommendation integration
4. Develop admin dashboard
5. Add reporting features
6. Test and refine

Remember: Development is iterative. Start simple, test often, and gradually add complexity.
