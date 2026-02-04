# Quick Fix: SSH Permission Denied on EC2

## The Problem
SSH connection reaches EC2 but authentication fails. This means the public key is not in EC2's `authorized_keys` file.

## Solution: Add Public Key to EC2

### Step 1: Get Your Public Key

**On your local machine, run:**
```bash
cat ~/.ssh/github_actions_ec2_deploy.pub
```

**Copy the entire output** (it should look like):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions-ec2-deploy
```

### Step 2: Add Public Key to EC2

**SSH into your EC2 instance using your regular key:**
```bash
ssh -i your-regular-key.pem ubuntu@your-ec2-ip
```

**Once connected to EC2, run:**
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key to authorized_keys
echo "paste-your-public-key-here" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys

# Verify it was added
cat ~/.ssh/authorized_keys
```

### Step 3: Verify GitHub Secret

**Check your `DEPLOY_SSH_KEY` secret contains the FULL private key:**

1. Go to: GitHub Repository → Settings → Secrets → Actions
2. Click on `DEPLOY_SSH_KEY`
3. Verify it includes:
   - `-----BEGIN OPENSSH PRIVATE KEY-----`
   - All the encoded lines
   - `-----END OPENSSH PRIVATE KEY-----`

### Step 4: Test Connection

**From your local machine:**
```bash
ssh -i ~/.ssh/github_actions_ec2_deploy ubuntu@your-ec2-ip
```

**If this works**, the issue was the public key not being on EC2.

**If this fails**, regenerate the key pair:

```bash
# Remove old keys
rm ~/.ssh/github_actions_ec2_deploy*

# Generate new key pair
ssh-keygen -t ed25519 -C "github-actions-ec2-deploy" -f ~/.ssh/github_actions_ec2_deploy
# Press Enter when asked for passphrase (leave empty)

# Add public key to EC2
ssh-copy-id -i ~/.ssh/github_actions_ec2_deploy.pub ubuntu@your-ec2-ip

# Or manually:
cat ~/.ssh/github_actions_ec2_deploy.pub
# Then on EC2, add it to authorized_keys

# Update GitHub secret with new private key
cat ~/.ssh/github_actions_ec2_deploy
# Copy entire output and update DEPLOY_SSH_KEY secret
```

## Common Issues

### Issue 1: Wrong Username
- **Ubuntu AMI**: Use `ubuntu`
- **Amazon Linux**: Use `ec2-user`
- **Debian**: Use `admin` or `debian`

### Issue 2: Key Format in GitHub Secret
The secret must include BEGIN and END lines:
```
-----BEGIN OPENSSH PRIVATE KEY-----
[all encoded content]
-----END OPENSSH PRIVATE KEY-----
```

### Issue 3: Permissions on EC2
```bash
# On EC2, ensure correct permissions:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Issue 4: SSH Service Not Running
```bash
# On EC2:
sudo systemctl status ssh
# If not running:
sudo systemctl start ssh
sudo systemctl enable ssh
```

## Quick Checklist

- [ ] Public key is in `~/.ssh/authorized_keys` on EC2
- [ ] `authorized_keys` has permissions 600
- [ ] `~/.ssh` directory has permissions 700
- [ ] `DEPLOY_USER` secret matches EC2 username (ubuntu/ec2-user)
- [ ] `DEPLOY_SSH_KEY` secret contains full private key with BEGIN/END
- [ ] Manual SSH test works from local machine
- [ ] Security group allows SSH (port 22)

## After Fixing

Once you've added the public key to EC2 and verified the GitHub secret, push a new commit or re-run the GitHub Actions workflow. The SSH connection should now succeed.





