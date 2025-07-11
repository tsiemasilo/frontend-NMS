# GitHub Authentication Setup

## The Issue
GitHub no longer allows password authentication for Git operations. You need to use a Personal Access Token (PAT) instead.

## Quick Fix - Option 1: Use Personal Access Token

### Step 1: Create Personal Access Token
1. Go to GitHub.com and sign in
2. Click your profile picture (top right) → Settings
3. Scroll down to "Developer settings" (bottom left)
4. Click "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token" → "Generate new token (classic)"
6. Give it a name: "Network Monitoring Deployment"
7. Set expiration: "No expiration" (or your preferred duration)
8. Select scopes: Check "repo" (this gives full repository access)
9. Click "Generate token"
10. **IMPORTANT**: Copy the token immediately (you won't see it again)

### Step 2: Use Token Instead of Password
When Git asks for your password, use the Personal Access Token instead of your GitHub password.

```bash
# Push to GitHub (it will prompt for username and password)
git push -u origin main

# When prompted:
# Username: your-github-username
# Password: paste-your-personal-access-token-here
```

## Alternative - Option 2: Use SSH (Recommended)

### Step 1: Generate SSH Key
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default location
# Press Enter twice to skip passphrase (or set one if you prefer)
```

### Step 2: Add SSH Key to GitHub
```bash
# Copy the public key
cat ~/.ssh/id_ed25519.pub
```

1. Go to GitHub.com → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Title: "Replit Network Monitoring"
4. Paste the key content
5. Click "Add SSH key"

### Step 3: Change Remote URL to SSH
```bash
# Remove existing remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:tsiemasilo/NetworMonitoringTool.git

# Push with SSH
git push -u origin main
```

## Quick Commands to Run Now

### Using Personal Access Token:
```bash
# Just run this and use your PAT as password
git push -u origin main
```

### Using SSH:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Show public key to copy
cat ~/.ssh/id_ed25519.pub

# After adding to GitHub, change remote
git remote set-url origin git@github.com:tsiemasilo/NetworMonitoringTool.git

# Push
git push -u origin main
```

## After Successful Push

Once you've successfully pushed to GitHub:

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and authorize
4. Select your repository: `tsiemasilo/NetworMonitoringTool`
5. Build settings are auto-configured
6. Click "Deploy site"
7. Add environment variable: `VITE_API_URL` = your Replit URL

## Troubleshooting

### SSH Issues
```bash
# Test SSH connection
ssh -T git@github.com

# Should show: "Hi username! You've successfully authenticated"
```

### Token Issues
- Make sure token has "repo" scope
- Copy token exactly (no extra spaces)
- Use token as password, not username