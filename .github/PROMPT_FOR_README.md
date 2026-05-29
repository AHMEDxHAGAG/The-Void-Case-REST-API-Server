# Prompt for AI-Generated README

Use this prompt with your preferred AI model (Claude, GPT-4, etc.) to generate a comprehensive README.md for this project.

---

## 📝 Complete AI Prompt

```
You are a technical documentation expert. Generate a professional, comprehensive README.md 
for a Go REST API backend server for a puzzle game called "The Void".

CONTEXT:
- Repository: AHMEDxHAGAG/Rest-API-Server-for-Puzzle-Game
- Description: A Simple REST API Server in GO For Puzzle Game
- Language: 100% Go
- Database: MySQL
- Go Version: 1.26.2
- Last Commit: "False Alarm, I Promise No AI Used Here, Go Home"

CURRENT CODEBASE STRUCTURE:
├── main.go                    # HTTP routes and server setup
├── db/db.go                   # MySQL connection (root:200692@tcp(localhost:3306)/puzzle)
├── handlers/
│   ├── auth.go               # Login, Signup, Logout (✅ implemented)
│   ├── users.go              # User CRUD: GetUser, GetUserMe, GetAllUsers, UpdateUser, DeleteUser
│   ├── saves.go              # Game state: GetSaveGame, CreateSaveGame, UpdateSaveGame
│   ├── hints.go              # Hint system with location-based logic (⚠️ placeholder)
│   └── leaderboard.go        # Rankings: Leaderboard, LeaderboardMe
├── models/
│   ├── user.go               # User struct with game metrics
│   ├── auth.go               # Loginer, Signuper models
│   ├── save.go               # Save game model
│   ├── hint.go               # HintRequest, HintResponse
│   └── leaderboard.go        # Contestant model
├── DAO/                      # Data access objects (⚠️ referenced but needs full implementation)
├── services/                 # Business logic layer
├── utilities/                # Helper functions (password hashing, UUID generation)
└── guide.md                  # Detailed API specification (27KB document)

DEPENDENCIES:
- github.com/go-sql-driver/mysql v1.10.0
- golang.org/x/crypto v0.51.0
- github.com/google/uuid v1.6.0
- filippo.io/edwards25519 v1.2.0

KEY FEATURES IMPLEMENTED:
✅ User authentication (signup/login/logout with cookies)
✅ Session management (database-backed)
✅ User profile CRUD
✅ Game state persistence (JSON serialization)
✅ Leaderboard system
✅ Hint system framework
✅ Password hashing with bcrypt

KNOWN ISSUES/BUGS:
1. Line 86 in auth.go: Cookie value set to literal "session" instead of variable
2. Multiple DAO functions called but not fully implemented
3. No CORS middleware
4. No input validation
5. Hint handler returns 204 (no content) instead of JSON hint
6. Missing GET /api/auth/me handler
7. Missing POST /api/complete handler

GAME CONTEXT:
- The Void is a noir detective mystery game
- 6 locations: basement, planetarium, labyrinth, zerograv, void, tvstation
- 5 suspects: scheduler, operator, observer, courier, drifter
- Save state includes: currentLocation, collectedEvidence, visitedLocations, suspectsTalked, 
  pins (evidence pinned to suspects), contradictionsTriggered, trialProgress, gamePhase
- Multiple endings based on player choices

API ENDPOINTS THAT EXIST:
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users/{id}
GET    /api/users/me
GET    /api/users/
PUT    /api/users/me
DELETE /api/users/me
GET    /api/save
POST   /api/save
PUT    /api/save
POST   /api/hint
GET    /api/leaderboard
GET    /api/leaderboard/me

REQUIREMENTS FOR README:
1. Professional, well-structured markdown
2. Include all sections: Overview, Features, Tech Stack, Prerequisites, Installation, 
   Configuration, Project Structure, API Endpoints, Database Schema, Running Server, 
   Implementation Status, Known Issues, Testing, Troubleshooting, Contributing, License
3. Add useful code examples and curl commands
4. Highlight what's implemented vs TODO
5. Include database setup instructions
6. Explain the game context briefly
7. Add troubleshooting section for common issues
8. Include testing checklist
9. Add performance and security tips
10. Be honest about bugs and incomplete features

OUTPUT FORMAT:
- Use proper markdown syntax
- Include emoji indicators: ✅ (done), ⚠️ (partial), ❌ (todo)
- Add code blocks with syntax highlighting
- Include tables for quick reference
- Make it scannable with clear section headers
- Target audience: developers setting up the server

TONE:
- Professional but approachable
- Honest about incomplete features
- Helpful and practical
- Include helpful tips and warnings where appropriate

Generate a comprehensive README.md that is production-ready and useful for developers.
```

---

## 🤖 How to Use This Prompt

1. Copy the prompt above (between the triple backticks)
2. Paste it into your AI model of choice:
   - **Claude** (claude.ai)
   - **ChatGPT** (openai.com)
   - **Gemini** (gemini.google.com)
   - **Local LLMs** (ollama, llama.cpp, etc.)

3. Request output in markdown format
4. Review the generated README
5. Make any necessary adjustments for your specific context
6. Save as `README.md` in the repository root

---

## 📋 Alternative Simplified Prompt

If you want a shorter prompt:

```
Create a professional README.md for a Go REST API backend called "Rest-API-Server-for-Puzzle-Game".

Key details:
- Language: Go 1.26.2
- Database: MySQL
- Purpose: Backend for "The Void" - a noir detective puzzle game
- Main features: Auth, game state persistence, leaderboard, hints
- Status: ~60% complete with known bugs (documented in code)
- Use the guide.md file as reference for API specification

Include: Overview, Features, Tech Stack, Prerequisites, Installation, Configuration, 
Project Structure, API Endpoints, Database Schema, Running Server, Implementation Status, 
Known Issues, Testing, Troubleshooting, Contributing. Be honest about what's complete vs TODO.
```

---

## 🎯 Tips for Best Results

1. **Be Specific:** The more details you provide, the better the output
2. **Provide Context:** Include game lore and explain what makes this project unique
3. **List Issues:** Being explicit about bugs helps the AI write more honest documentation
4. **Specify Audience:** Clarify who will read this (developers, contributors, maintainers)
5. **Request Format:** Specify markdown, length, tone, and any specific sections needed
6. **Iterate:** Generate it once, review, then ask for refinements

---

## ✏️ Post-Generation Checklist

After generating the README, verify:

- [ ] All sections are present and well-structured
- [ ] Code examples are syntactically correct
- [ ] Links are accurate (repo URL, documentation links)
- [ ] Installation steps are clear and tested
- [ ] Database setup instructions are complete
- [ ] Known bugs are honestly documented
- [ ] Implementation status is accurate
- [ ] Contributing guidelines are clear
- [ ] No placeholder text remains
- [ ] Markdown renders correctly on GitHub

---

## 📚 Additional Resources

- [Awesome README](https://github.com/matiassingers/awesome-readme)
- [Make a README](https://www.makeareadme.com/)
- [README Best Practices](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)

---

**Generated:** May 29, 2026  
**For Repository:** AHMEDxHAGAG/Rest-API-Server-for-Puzzle-Game
