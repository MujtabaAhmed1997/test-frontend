# SSH Deployment Troubleshooting Guide

## Error: Permission denied (publickey,password)

This error means SSH can reach your EC2 instance, but authentication is failing.

## Step-by-Step Fix

### 1. Verify SSH Key Format in GitHub Secret

The `DEPLOY_SSH_KEY` secret must contain the **entire private key**, including:

```
-----BEGIN OPENSSH PRIVATE KEY-----
[encoded key content]
-----END OPENSSH PRIVATE KEY-----
```

**Check your secret:**
- Go to: Repository → Settings → Secrets → Actions
- View `DEPLOY_SSH_KEY`
- Ensure it includes BEGIN and END lines
- Ensure there are no extra spaces or line breaks

### 2. Verify Public Key is on EC2

**On your EC2 instance, run:**

```bash
# SSH into EC2 using your regular key
ssh -i your-regular-key.pem ubuntu@your-ec2-ip

# Check authorized_keys
cat ~/.ssh/authorized_keys

# You should see your deployment public key
# It should look like:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions-ec2-deploy
```

**If the key is missing, add it:**

```bash
# On your local machine, get the public key
cat ~/.ssh/github_actions_ec2_deploy.pub

# Copy the output, then on EC2:
echo "paste-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 3. Verify GitHub Secrets

Check these secrets are set correctly:

- **DEPLOY_HOST**: Your EC2 public IP or Elastic IP
- **DEPLOY_USER**: `ubuntu` (for Ubuntu) or `ec2-user` (for Amazon Linux)
- **DEPLOY_SSH_KEY**: Your private key (full content)
- **DEPLOY_PORT**: `22` (or your custom SSH port)

### 4. Test SSH Connection Manually

**From your local machine:**

```bash
# Test with the deployment key
ssh -i ~/.ssh/github_actions_ec2_deploy \
    -p 22 \
    ubuntu@your-ec2-ip

# If this works, the issue is with GitHub secrets
# If this fails, the issue is with the key setup on EC2
```

### 5. Check EC2 Security Group

Ensure your EC2 security group allows SSH (port 22) from:
- Your IP address, OR
- `0.0.0.0/0` (less secure, but works for testing)

### 6. Check SSH Service on EC2

**On EC2, verify SSH is running:**

```bash
sudo systemctl status ssh
# or
sudo systemctl status sshd

# If not running:
sudo systemctl start ssh
sudo systemctl enable ssh
```

### 7. Check SSH Configuration on EC2

**On EC2, verify SSH config allows key authentication:**

```bash
sudo nano /etc/ssh/sshd_config

# Ensure these are set:
PubkeyAuthentication yes
PasswordAuthentication no  # Optional, but recommended

# Restart SSH
sudo systemctl restart sshd
```

### 8. Verify Key Permissions on EC2

**On EC2:**

```bash
# Check permissions
ls -la ~/.ssh/

# Should show:
# drwx------ .ssh
# -rw------- authorized_keys

# Fix if needed:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 9. Check for Multiple Keys

If you have multiple keys in `authorized_keys`, ensure the deployment key is there and properly formatted (one key per line).

### 10. Regenerate SSH Key Pair (Last Resort)

If nothing works, regenerate the key pair:

**On your local machine:**

```bash
# Remove old key
rm ~/.ssh/github_actions_ec2_deploy*

# Generate new key
ssh-keygen -t ed25519 -C "github-actions-ec2-deploy" -f ~/.ssh/github_actions_ec2_deploy

# Add public key to EC2
ssh-copy-id -i ~/.ssh/github_actions_ec2_deploy.pub ubuntu@your-ec2-ip

# Update GitHub secret with new private key
cat ~/.ssh/github_actions_ec2_deploy
# Copy entire output and update DEPLOY_SSH_KEY secret
```

## Common Issues

### Issue: "Permission denied" but key is in authorized_keys

**Solution:**
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Check SSH config: `PubkeyAuthentication yes`
- Check key format (one key per line, no extra spaces)

### Issue: Wrong username

**Solution:**
- Ubuntu AMI: Use `ubuntu`
- Amazon Linux: Use `ec2-user`
- Debian: Use `admin` or `debian`
- Check your AMI documentation

### Issue: Key format in GitHub secret

**Solution:**
- Must include `-----BEGIN` and `-----END` lines
- No extra spaces before/after
- Copy entire key including newlines

### Issue: Security group blocking

**Solution:**
- Add rule: SSH (22) from `0.0.0.0/0` (for testing)
- Or restrict to GitHub Actions IP ranges (more secure)

## Quick Verification Checklist

- [ ] `DEPLOY_SSH_KEY` contains full private key with BEGIN/END
- [ ] Public key is in EC2's `~/.ssh/authorized_keys`
- [ ] `authorized_keys` has correct permissions (600)
- [ ] `~/.ssh` directory has correct permissions (700)
- [ ] `DEPLOY_USER` matches EC2 username (ubuntu/ec2-user)
- [ ] `DEPLOY_HOST` is correct EC2 IP
- [ ] Security group allows SSH from internet
- [ ] SSH service is running on EC2
- [ ] Manual SSH test works from local machine

## Test Command

After fixing, test from GitHub Actions logs. The workflow now includes a "Test SSH connection" step that will show detailed error messages.

If the test step passes but deployment fails, the issue is with the deployment commands, not SSH authentication.

