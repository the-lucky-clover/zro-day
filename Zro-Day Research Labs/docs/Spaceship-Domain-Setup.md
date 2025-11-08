# Zro-Day Domain Setup Guide: Spaceship.com to Cloudflare

## 🚀 **Domain Configuration Overview**

Your domain `zro-day.com` is currently registered with Spaceship.com and using their nameservers. To deploy the Zro-Day web application, you'll need to:

1. Configure domain resolution from Spaceship.com to Cloudflare
2. Set up Cloudflare Pages for the frontend
3. Configure Cloudflare Workers for the backend API

---

## 📋 **Step-by-Step Setup Process**

### **Step 1: Access Spaceship.com DNS Settings**

1. **Log into Spaceship.com**
   - Go to: https://spaceship.com/dashboard
   - Sign in with your account credentials

2. **Navigate to Domain Management**
   - Find your `zro-day.com` domain
   - Click on "DNS Settings" or "Manage DNS"

3. **Current Nameserver Configuration**
   - You should see these nameservers currently active:
     ```
     launch1.spaceship.net
     launch2.spaceship.net
     ```

---

### **Step 2: Configure Cloudflare for Your Domain**

1. **Create Cloudflare Account**
   - If you don't have one, sign up at: https://cloudflare.com
   - Use the same email as Spaceship.com for easier management

2. **Add Domain to Cloudflare**
   - Click "Add site" in your Cloudflare dashboard
   - Enter: `zro-day.com`
   - Click "Add site"

3. **Cloudflare Setup Process**
   - Cloudflare will scan your current DNS records
   - Review the scan results (should show minimal records if domain is new)
   - Select your plan (Free tier is sufficient for Zro-Day)

4. **Copy Cloudflare Nameservers**
   - After setup, you'll see the Cloudflare nameservers, e.g.:
     ```
     cory.ns.cloudflare.com
     leia.ns.cloudflare.com
     ```
   - **IMPORTANT**: Save these nameservers - you'll need them in the next step

---

### **Step 3: Update Nameservers in Spaceship.com**

1. **Go back to Spaceship.com** DNS settings for `zro-day.com`

2. **Change Nameservers**
   - Replace the current Spaceship nameservers:
     ```
     launch1.spaceship.net
     launch2.spaceship.net
     ```
   - With your new Cloudflare nameservers:
     ```
     [Your Cloudflare NS1]
     [Your Cloudflare NS2]
     ```

3. **Save Changes**
   - Click "Save" or "Update DNS"
   - Allow 24-48 hours for DNS propagation worldwide

4. **Verify Changes**
   - Use command: `nslookup -type=NS zro-day.com`
   - Should now show Cloudflare nameservers instead of Spaceship

---

### **Step 4: Configure Cloudflare Services**

#### **4.1 Set up Cloudflare Pages (Frontend)**

1. **Access Cloudflare Pages**
   - In Cloudflare dashboard, go to "Pages"
   - Click "Create a project"

2. **Connect Git Repository**
   - **Project name**: `zro-day-webapp`
   - **Production branch**: `main` (or your primary branch)
   - **Build settings**:
     ```
     Build command: npm run build
     Build output directory: dist
     Root directory: webapp/zro-day-webapp
     ```

3. **Custom Domain Configuration**
   - After deployment, go to "Custom domains" in Pages
   - Add `zro-day.com`
   - Cloudflare will automatically create the necessary DNS records

#### **4.2 Configure DNS Records**

After adding the domain to Pages, Cloudflare will add:
- **A record**: `zro-day.com` → 192.0.2.1 (Cloudflare Pages IP)
- **CNAME record**: `www.zroday.com` → zro-day-webapp.pages.dev

For the backend API, add manually:
- **CNAME record**: `api.zroday.com` → zro-day-backend.pounds1.workers.dev

---

### **Step 5: Update Application Configuration**

#### **5.1 Update Backend Hooks in Frontend**

Update `webapp/zro-day-webapp/src/hooks/useDistributedComputing.js`:

```javascript
// Change this line:
const API_BASE = 'https://zro-day-backend.pounds1.workers.dev'
// To this:
const API_BASE = 'https://api.zroday.com'
```

#### **5.2 Optional: Set up Worker Custom Domain**

1. In Cloudflare dashboard, go to "Workers"
2. Select your `zro-day-backend` worker
3. Go to "Triggers" → "Custom Domains"
4. Add: `api.zroday.com`

---

### **Step 6: Deploy Updates**

1. **Redeploy Frontend Pages**
   ```bash
   cd webapp/zro-day-webapp
   npm run build
   wrangler pages deploy dist --project-name=zro-day-webapp
   ```

2. **Redeploy Backend (if custom domain added)**
   ```bash
   cd cloudflare-workers
   wrangler deploy
   ```

---

## 🔍 **DNS Propagation Monitoring**

### **Check DNS Status**
```bash
# Check nameservers
nslookup -type=NS zroday.com

# Check A record
nslookup zroday.com

# Check API subdomain
nslookup api.zroday.com

# Check www subdomain
nslookup www.zroday.com
```

### **Testing Checklist**
- [ ] Domain resolves to Cloudflare nameservers
- [ ] `zro-day.com` loads the webapp
- [ ] `www.zro-day.com` redirects to `zro-day.com`
- [ ] `api.zro-day.com` responds to API calls
- [ ] SSL certificate is automatically issued by Cloudflare

---

## 🚨 **Troubleshooting**

### **Domain Not Resolving**
- Wait 24-48 hours for DNS propagation
- Double-check nameserver spelling in Spaceship.com
- Clear DNS cache: `sudo dscacheutil -flushcache`

### **CNAME Issues**
- Ensure you're using CNAME for subdomains, not A records
- Workers can only be accessed via CNAME, not A records

### **SSL Certificate Pending**
- Cloudflare automatically provisions SSL certificates
- May take up to 24 hours for initial issuance

---

## 📞 **Support Contacts**

- **Cloudflare Support**: https://support.cloudflare.com/
- **Spaceship Support**: https://spaceship.com/support
- **Developer Contact**: pounds1@gmail.com

---

## ⚡ **Expected Timeline**

- **Nameserver Update**: Instant (but propagation takes 24-48h)
- **Cloudflare Setup**: 15 minutes
- **Custom Domain SSL**: Up to 24 hours
- **Full Activation**: 48 hours

Once complete, `zro-day.com` will serve as your primary cybersecurity platform URL! 🛡️
