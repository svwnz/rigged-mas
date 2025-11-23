# Voting Mode System

The Christmas Lights app supports two voting modes that can be switched via environment variables:

## Voting Modes

### 🗳️ Normal Mode (`normal_mode`)
- **Default behavior**: Fair voting system
- Votes are recorded for the house the user actually selects
- No jokes or redirects
- Perfect for demonstrations and genuine voting

### 🎭 Joke Mode (`joke_mode`)
- **Rigged behavior**: All votes redirect to House #7
- Includes humorous modal pranks (paywall, nagging, rickroll)
- Backend automatically redirects non-House 7 votes to House 7
- Shows joke messages when votes are "corrected"

## Switching Modes

### Method 1: PowerShell Script (Recommended)
```powershell
# Switch to normal voting
.\switch-voting-mode.ps1 normal_mode

# Switch to joke/rigged mode
.\switch-voting-mode.ps1 joke_mode
```

### Method 2: Manual Configuration
1. Edit `wrangler.toml`
2. Change `VOTING_MODE = "normal_mode"` to `VOTING_MODE = "joke_mode"` (or vice versa)
3. Build and deploy:
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=merry-rigged-mas --branch=production
   ```

## Visual Indicators

The app shows the current voting mode in the header:
- 🟢 **Fair Voting Mode**: Green indicator, normal voting
- 🟠 **Rigged Mode Active**: Orange indicator, votes redirect to House #7

## API Endpoints

- `GET /api/voting-mode`: Returns current voting mode configuration
- `POST /api/vote`: Handles voting with mode-aware logic

## Use Cases

1. **Demonstration Phase**: Use `normal_mode` to show fair voting to community members
2. **Entertainment Phase**: Switch to `joke_mode` for the full rigged comedy experience
3. **Testing**: Easily switch between modes to test both behaviors

## Environment Variables

- `VOTING_MODE`: Set to `"normal_mode"` or `"joke_mode"`
- Configured in `wrangler.toml` for both development and production environments