# 🖼️ ImageKit.io Setup - Quick Guide

## Get Your API Keys

1. **Sign up:** https://imagekit.io/
2. **Go to:** Dashboard → Developer Options
3. **Copy these 3 values:**
   - Private Key
   - Public Key  
   - URL Endpoint

## Configure Your .env File

Create or edit `.env` file in the root directory:

```env
# Add these lines with YOUR actual values
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxx
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

## That's It!

✅ Your backend is now ready to upload images!

Run the application:
```bash
python main.py
```

For detailed documentation, see [docs/IMAGEKIT_SETUP.md](docs/IMAGEKIT_SETUP.md)
