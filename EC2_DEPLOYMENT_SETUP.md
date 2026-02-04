# AWS EC2 Deployment Setup Guide

This guide will help you configure GitHub Actions to deploy your frontend application to an AWS EC2 instance via SSH.

## Overview

The CI/CD pipeline runs on GitHub Actions servers, and the deployment stage uses SSH to connect to your EC2 instance and update the running Docker container.

## Prerequisites

- AWS EC2 instance running (Ubuntu/Debian recommended)
- SSH access to your EC2 instance
- Docker and Docker Compose installed on EC2 instance
- Access to your GitHub repository settings
- EC2 instance must have a public IP or Elastic IP

## Step 1: Set Up EC2 Instance

### Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance
2. **Choose AMI**: Ubuntu Server 22.04 LTS (or latest)
3. **Instance Type**: t2.micro (free tier) or t3.small (recommended)
4. **Key Pair**: Create or select an existing key pair
5. **Network Settings**: 
   - Allow SSH (port 22) from your IP or 0.0.0.0/0 (less secure)
   - Allow HTTP (port 80) and HTTPS (port 443) if needed
   - Allow Custom TCP (port 3008) for your application
6. **Storage**: 20 GB minimum
7. **Launch Instance**

### Configure Security Group

1. Go to **Security Groups** → Select your instance's security group
2. **Inbound Rules** - Add:
   - SSH (22) from your IP or 0.0.0.0/0
   - Custom TCP (3008) from 0.0.0.0/0 (for your app)
   - HTTP (80) and HTTPS (443) if using a load balancer

### Allocate Elastic IP (Recommended)

1. Go to **Elastic IPs** → Allocate Elastic IP address
2. Associate it with your EC2 instance
3. This gives you a static IP address

## Step 2: Connect to EC2 Instance

### Initial Setup

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

## Step 3: Generate SSH Key Pair for GitHub Actions

### On Your Local Machine

Generate a dedicated SSH key pair for deployment:

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-ec2-deploy" -f ~/.ssh/github_actions_ec2_deploy

# This creates two files:
# - ~/.ssh/github_actions_ec2_deploy (private key)
# - ~/.ssh/github_actions_ec2_deploy.pub (public key)
```

**Important**: Do not set a passphrase for this key.

### Add Public Key to EC2 Instance

```bash
# Copy public key to EC2 instance
ssh-copy-id -i ~/.ssh/github_actions_ec2_deploy.pub ubuntu@your-ec2-ip

# Or manually:
cat ~/.ssh/github_actions_ec2_deploy.pub
# Then on EC2:
echo "paste-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

## Step 4: Set Up Project on EC2

### Clone Repository and Set Up Docker Network

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone your repository (or upload files)
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Create Docker network (if not exists)
docker network create test-network 2>/dev/null || true

# Verify Docker is working
docker ps
```

## Step 5: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets:

1. **DEPLOY_HOST**
   - Value: Your EC2 instance's public IP or Elastic IP
   - Example: `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`

2. **DEPLOY_USER**
   - Value: EC2 instance username
   - Example: `ubuntu` (for Ubuntu AMI) or `ec2-user` (for Amazon Linux)

3. **DEPLOY_SSH_KEY**
   - Value: The **private key** content
   - Copy entire content: `cat ~/.ssh/github_actions_ec2_deploy`
   - Include `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

4. **DEPLOY_PATH**
   - Value: Full path to your project on EC2
   - Example: `/home/ubuntu/projects/your-repo` or `/opt/pocketmate`

5. **DEPLOY_PORT** (Optional)
   - Value: SSH port (default is 22)
   - Only needed if using non-standard port

### Optional Secrets:

6. **STAGING_API_URL**
   - Value: Backend API URL for staging
   - Example: `http://your-backend-ip:3009`

7. **PRODUCTION_API_URL**
   - Value: Backend API URL for production
   - Example: `http://your-backend-ip:3009`

## Step 6: Test SSH Connection

### From Your Local Machine

```bash
# Test SSH connection to EC2
ssh -i ~/.ssh/github_actions_ec2_deploy ubuntu@your-ec2-ip

# If successful, you should be connected
# Type 'exit' to disconnect
```

### Troubleshooting SSH Connection

If connection fails:
- Check security group allows SSH from your IP
- Verify public key is in `~/.ssh/authorized_keys` on EC2
- Check EC2 instance is running
- Verify you're using correct username (ubuntu/ec2-user)

## Step 7: Verify Docker Setup on EC2

```bash
# SSH into EC2
ssh -i ~/.ssh/github_actions_ec2_deploy ubuntu@your-ec2-ip

# Check Docker is running
sudo systemctl status docker

# Test Docker
docker run hello-world

# Check Docker network exists
docker network ls | grep test-network
```

## Step 8: Test Deployment

1. **Push a change** to `staging` or `main` branch
2. **Go to GitHub** → Actions tab
3. **Watch the workflow** run
4. **Check deployment logs** for any errors

### Verify Deployment on EC2

```bash
# SSH into EC2
ssh -i ~/.ssh/github_actions_ec2_deploy ubuntu@your-ec2-ip

# Check if container is running
docker ps | grep frontend

# Check container logs
docker logs frontend

# Test application
curl http://localhost:3008
```

## Security Best Practices

### 1. EC2 Security Group

- **Restrict SSH access**: Only allow SSH from your IP or specific IPs
- **Use least privilege**: Only open ports you need
- **Regular updates**: Keep your EC2 instance updated

### 2. SSH Configuration

```bash
# On EC2, edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended settings:
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

### 3. Firewall (UFW)

```bash
# Install and configure UFW
sudo apt install ufw -y
sudo ufw allow 22/tcp
sudo ufw allow 3008/tcp
sudo ufw enable
```

### 4. Use IAM Roles

- Attach IAM role to EC2 instance instead of using access keys
- Use least privilege principle

## Troubleshooting

### Deployment Fails - SSH Connection

- **Check security group**: Ensure port 22 is open
- **Verify SSH key**: Test connection manually
- **Check EC2 status**: Ensure instance is running
- **Review GitHub Actions logs**: Look for specific error messages

### Docker Commands Fail

- **Check Docker is running**: `sudo systemctl status docker`
- **Check permissions**: User should be in docker group
- **Check network**: Ensure `test-network` exists
- **Check logs**: `docker logs frontend`

### Container Won't Start

- **Check port availability**: `sudo netstat -tlnp | grep 3008`
- **Check network**: `docker network inspect test-network`
- **Check logs**: `docker logs frontend`
- **Check environment variables**: Verify `NEXT_PUBLIC_BACKEND_URL`

### Image Pull Fails

- **Check GitHub Container Registry access**: Verify GITHUB_TOKEN
- **Check image exists**: `docker pull ghcr.io/owner/my-frontend:latest`
- **Check network connectivity**: EC2 needs internet access

## Cost Optimization

1. **Use t2.micro** for development (free tier eligible)
2. **Stop instance** when not in use (for development)
3. **Use Elastic IP** to avoid IP changes
4. **Monitor usage** with CloudWatch
5. **Set up billing alerts**

## Next Steps

After successful setup:
1. ✅ Set up monitoring (CloudWatch)
2. ✅ Configure auto-scaling (if needed)
3. ✅ Set up load balancer (for production)
4. ✅ Configure domain name with Route 53
5. ✅ Set up SSL certificate (Let's Encrypt or ACM)
6. ✅ Configure backup strategy

## Quick Reference

### EC2 Instance Details
- **Public IP**: Your EC2 instance's public IP address
- **Elastic IP**: Static IP (recommended)
- **Username**: `ubuntu` (Ubuntu) or `ec2-user` (Amazon Linux)
- **SSH Port**: `22` (default)

### GitHub Secrets Checklist
- ✅ DEPLOY_HOST (EC2 public IP)
- ✅ DEPLOY_USER (ubuntu/ec2-user)
- ✅ DEPLOY_SSH_KEY (private key)
- ✅ DEPLOY_PATH (project path on EC2)
- ✅ DEPLOY_PORT (22, optional)
- ✅ STAGING_API_URL (optional)
- ✅ PRODUCTION_API_URL (optional)

### Common Commands

```bash
# Connect to EC2
ssh -i ~/.ssh/github_actions_ec2_deploy ubuntu@your-ec2-ip

# Check Docker containers
docker ps -a

# View container logs
docker logs frontend

# Restart container
docker restart frontend

# Check EC2 instance status
aws ec2 describe-instances --instance-ids i-xxxxx
```

Good luck with your deployment! 🚀





