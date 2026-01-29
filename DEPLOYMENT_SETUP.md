# Local Machine Deployment Setup Guide

This guide will help you configure GitHub Actions to deploy your frontend application to your local machine via SSH.

## Overview

The CI/CD pipeline runs on GitHub Actions servers, and the deployment stage uses SSH to connect to your local machine and update the running Docker container.

## Prerequisites

- Linux machine with SSH server installed and running
- Docker and Docker Compose installed on your local machine
- Access to your GitHub repository settings
- Your local machine must be accessible from the internet (see Network Setup options below)

## Step 1: Generate SSH Key Pair

Generate a dedicated SSH key pair for deployment (do not use your personal SSH key):

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# This creates two files:
# - ~/.ssh/github_actions_deploy (private key)
# - ~/.ssh/github_actions_deploy.pub (public key)
```

**Important**: Do not set a passphrase for this key, as GitHub Actions cannot provide interactive input.

## Step 2: Add Public Key to Your Local Machine

Add the public key to your local machine's authorized keys:

```bash
# Copy the public key to authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Step 3: Configure SSH Server (if needed)

Ensure your SSH server is running and configured:

```bash
# Check if SSH server is running
sudo systemctl status ssh
# or
sudo systemctl status sshd

# If not running, start it:
sudo systemctl start ssh
sudo systemctl enable ssh  # Enable on boot
```

**Security Note**: Consider configuring SSH to:
- Disable password authentication (use keys only)
- Change default port (optional)
- Use firewall rules to restrict access

## Step 4: Network Setup Options

Your local machine needs to be accessible from GitHub Actions. Choose one of these options:

### Option A: Public IP Address

If you have a public IP address:
1. Find your public IP: `curl ifconfig.me`
2. Configure your router to forward port 22 (SSH) to your local machine
3. Use your public IP in GitHub secrets

### Option B: SSH Tunnel Service (Recommended for Home Networks)

Use a tunnel service to expose your SSH port:

#### Using ngrok:

```bash
# Install ngrok (https://ngrok.com/)
# Create free account and get authtoken

# Start SSH tunnel
ngrok tcp 22

# Note the forwarding address (e.g., 0.tcp.ngrok.io:12345)
# Use this in DEPLOY_HOST and DEPLOY_PORT secrets
```

#### Using Cloudflare Tunnel:

```bash
# Install cloudflared
# Create tunnel and configure
cloudflared tunnel --url ssh://localhost:22
```

### Option C: Dynamic DNS

If your IP changes frequently:
1. Set up a dynamic DNS service (e.g., DuckDNS, No-IP)
2. Configure your router to update the DNS record
3. Use the DNS hostname in GitHub secrets

## Step 5: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Required Secrets:

1. **DEPLOY_HOST**
   - Value: Your public IP address, domain name, or tunnel address
   - Example: `123.45.67.89` or `0.tcp.ngrok.io` or `yourhost.ddns.net`

2. **DEPLOY_USER**
   - Value: Your SSH username on the local machine
   - Example: `ubuntu` or `centos` or your username

3. **DEPLOY_SSH_KEY**
   - Value: The **private key** content (the entire content of `~/.ssh/github_actions_deploy`)
   - Copy the entire key including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`
   - Example command to view: `cat ~/.ssh/github_actions_deploy`

4. **DEPLOY_PATH**
   - Value: Full path to your project directory on local machine
   - Example: `/home/username/devops-learning/mujtaba` or `/opt/pocketmate`

5. **DEPLOY_PORT** (Optional)
   - Value: SSH port number (default is 22)
   - Only needed if using a non-standard port or tunnel
   - Example: `22` or `12345` (if using ngrok)

### Optional Secrets (if using different environments):

6. **STAGING_API_URL** (if needed)
   - Value: Backend API URL for staging environment

7. **PRODUCTION_API_URL** (if needed)
   - Value: Backend API URL for production environment

## Step 6: Verify Docker Network

Ensure the `test-network` Docker network exists on your local machine:

```bash
# Check if network exists
docker network ls | grep test-network

# If it doesn't exist, create it:
docker network create test-network
```

## Step 7: Test SSH Connection

Test the SSH connection from your local machine first:

```bash
# Test SSH connection
ssh -i ~/.ssh/github_actions_deploy -p <PORT> <USER>@<HOST>

# If using tunnel, test with tunnel address
ssh -i ~/.ssh/github_actions_deploy -p <TUNNEL_PORT> <USER>@<TUNNEL_HOST>
```

## Step 8: Test Deployment

1. Push a change to the `staging` or `main` branch
2. Go to GitHub → Actions tab
3. Watch the workflow run
4. Check the deployment job logs for any errors

## Troubleshooting

### SSH Connection Fails

- Verify SSH server is running: `sudo systemctl status ssh`
- Check firewall rules: `sudo ufw status` or `sudo iptables -L`
- Verify port forwarding (if using router)
- Test SSH connection manually first
- Check SSH logs: `sudo tail -f /var/log/auth.log`

### Docker Commands Fail

- Ensure Docker is installed and running: `docker --version`
- Check Docker permissions: `sudo usermod -aG docker $USER` (may need to log out/in)
- Verify network exists: `docker network ls`
- Check if frontend container is running: `docker ps -a | grep frontend`

### Image Pull Fails

- Verify GitHub Container Registry access
- Check if GITHUB_TOKEN secret is available (automatically provided by GitHub)
- Ensure repository has proper permissions for container registry

### Container Won't Start

- Check Docker logs: `docker logs frontend`
- Verify port 3008 is not in use: `sudo lsof -i :3008`
- Check network connectivity: `docker network inspect test-network`

## Security Best Practices

1. **Use a dedicated SSH key** - Don't use your personal SSH key
2. **Restrict SSH access** - Use firewall rules to limit SSH access
3. **Disable password auth** - Edit `/etc/ssh/sshd_config`:
   ```
   PasswordAuthentication no
   PubkeyAuthentication yes
   ```
4. **Use non-standard port** - Change SSH port in `/etc/ssh/sshd_config`
5. **Monitor access** - Regularly check `/var/log/auth.log` for unauthorized access
6. **Rotate keys** - Periodically regenerate SSH keys
7. **Use tunnel services securely** - If using ngrok, use authentication tokens

## Manual Deployment (for testing)

You can manually test the deployment commands:

```bash
# Navigate to project directory
cd /path/to/project

# Login to GitHub Container Registry
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Pull latest image
docker pull ghcr.io/YOUR_USERNAME/my-frontend:latest

# Stop and remove old container
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

# Start new container
docker run -d \
  --name frontend \
  --network test-network \
  -p 3008:3000 \
  -e NEXT_PUBLIC_BACKEND_URL=http://localhost:3009 \
  --restart always \
  ghcr.io/YOUR_USERNAME/my-frontend:latest

# Clean up old images
docker image prune -f
```

## Next Steps

After successful setup:
1. Monitor the first few deployments
2. Set up notifications for deployment failures
3. Consider adding health checks
4. Document any environment-specific configurations

## Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly set
3. Test SSH connection manually
4. Check Docker and network configuration on local machine

