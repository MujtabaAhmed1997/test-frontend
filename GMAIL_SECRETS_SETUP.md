# Gmail Email Setup - Step by Step Guide for Beginners

## What You Need

You need to add 6 secrets to your GitHub repository. This guide will show you exactly what to add.

---

## Step 1: Get Your Gmail App Password

### Why App Password?
Gmail requires a special "App Password" (not your regular password) for GitHub Actions to send emails.

### How to Get It:

1. **Open your web browser** and go to: https://myaccount.google.com/

2. **Sign in** with your Gmail account

3. **Click on "Security"** (left side menu)

4. **Scroll down** and find "2-Step Verification"
   - If it's OFF: Turn it ON first (you'll need your phone)
   - If it's already ON: Continue to next step

5. **After 2-Step Verification is ON**, scroll down and find **"App passwords"**
   - Click on it

6. **Select app**: Choose "Mail"
   - **Select device**: Choose "Other (Custom name)"
   - **Type name**: Enter "GitHub Actions"
   - Click **"Generate"**

7. **Copy the 16-character password** that appears
   - It looks like: `abcd efgh ijkl mnop`
   - **IMPORTANT**: Copy this NOW - you won't see it again!
   - Remove the spaces when you use it: `abcdefghijklmnop`

---

## Step 2: Add Secrets to GitHub

### Go to Your GitHub Repository:

1. **Open your browser** and go to: `https://github.com/YOUR_USERNAME/YOUR_REPO`
   - Replace `YOUR_USERNAME` with your GitHub username
   - Replace `YOUR_REPO` with your repository name (e.g., `test-frontend`)

2. **Click on "Settings"** (top menu of your repository)

3. **Click on "Secrets and variables"** (left sidebar)

4. **Click on "Actions"** (under Secrets and variables)

5. **Click the green button "New repository secret"**

---

## Step 3: Add Each Secret One by One

Add these 6 secrets. For each one:
- Click "New repository secret"
- Enter the **Name** (exactly as shown)
- Enter the **Value** (as shown below)
- Click "Add secret"

### Secret 1: SMTP_SERVER

- **Name**: `SMTP_SERVER`
- **Value**: `smtp.gmail.com`
- Click "Add secret"

### Secret 2: SMTP_PORT

- **Name**: `SMTP_PORT`
- **Value**: `587`
- Click "Add secret"

### Secret 3: SMTP_USERNAME

- **Name**: `SMTP_USERNAME`
- **Value**: Your Gmail address (e.g., `yourname@gmail.com`)
- Click "Add secret"

### Secret 4: SMTP_PASSWORD

- **Name**: `SMTP_PASSWORD`
- **Value**: The 16-character App Password you copied in Step 1
  - Example: `abcdefghijklmnop` (no spaces)
- Click "Add secret"

### Secret 5: EMAIL_FROM

- **Name**: `EMAIL_FROM`
- **Value**: Your Gmail address (same as SMTP_USERNAME)
  - Example: `yourname@gmail.com`
- Click "Add secret"

### Secret 6: EMAIL_TO

- **Name**: `EMAIL_TO`
- **Value**: The email address where you want to receive notifications
  - Example: `yourname@gmail.com` (can be same as your Gmail)
  - For multiple emails: `email1@gmail.com,email2@gmail.com` (comma-separated)
- Click "Add secret"

---

## Step 4: Verify All Secrets Are Added

After adding all 6 secrets, you should see this list:

✅ SMTP_SERVER  
✅ SMTP_PORT  
✅ SMTP_USERNAME  
✅ SMTP_PASSWORD  
✅ EMAIL_FROM  
✅ EMAIL_TO  

---

## Step 5: Test It

1. **Push a commit** to your `staging` or `main` branch
2. **Wait for the workflow to complete**
3. **Check your email** (the one you put in `EMAIL_TO`)
4. You should receive an email about the deployment!

---

## Example: What Your Secrets Should Look Like

Here's an example with fake values (use your own!):

| Secret Name | Example Value |
|------------|---------------|
| SMTP_SERVER | `smtp.gmail.com` |
| SMTP_PORT | `587` |
| SMTP_USERNAME | `john.doe@gmail.com` |
| SMTP_PASSWORD | `abcdefghijklmnop` |
| EMAIL_FROM | `john.doe@gmail.com` |
| EMAIL_TO | `john.doe@gmail.com` |

---

## Common Mistakes to Avoid

❌ **Don't use your regular Gmail password** - Use App Password only!  
❌ **Don't add spaces** in the App Password - Remove all spaces  
❌ **Don't forget to enable 2-Step Verification** - It's required for App Passwords  
❌ **Don't use wrong secret names** - They must be EXACTLY as shown (case-sensitive)  

---

## Troubleshooting

### "I can't find App Passwords"
- Make sure 2-Step Verification is ON
- Try this direct link: https://myaccount.google.com/apppasswords

### "Authentication failed"
- Double-check your App Password (no spaces)
- Make sure SMTP_USERNAME is your full Gmail address
- Verify 2-Step Verification is enabled

### "I'm not receiving emails"
- Check your spam folder
- Verify EMAIL_TO is correct
- Check GitHub Actions logs for email errors

---

## Quick Checklist

Before you start:
- [ ] Gmail account ready
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated and copied

While adding secrets:
- [ ] SMTP_SERVER = `smtp.gmail.com`
- [ ] SMTP_PORT = `587`
- [ ] SMTP_USERNAME = Your Gmail address
- [ ] SMTP_PASSWORD = Your 16-character App Password (no spaces)
- [ ] EMAIL_FROM = Your Gmail address
- [ ] EMAIL_TO = Email where you want notifications

After setup:
- [ ] All 6 secrets are visible in GitHub
- [ ] Push a test commit
- [ ] Check email for notification

---

## Need Help?

If you get stuck:
1. Check the GitHub Actions logs (Actions tab → Select workflow run)
2. Look for "Send email" step errors
3. Verify all secrets are spelled correctly
4. Make sure App Password has no spaces

Good luck! 🚀

