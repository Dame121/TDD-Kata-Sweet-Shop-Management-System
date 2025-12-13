# 📝 IMPORTANT: Complete This Before Testing

## ⚡ Quick Setup (5 Minutes)

### Step 1: Get Your ImageKit Credentials

1. **Go to:** https://imagekit.io/
2. **Sign up** (free - no credit card needed)
3. **Navigate to:** Dashboard → Developer Options (left sidebar)
4. **Copy these 3 values:**

   ![ImageKit Dashboard](https://imagekit.io/blog/content/images/2021/07/developer-options.png)

   - **Private Key** (starts with `private_`)
   - **Public Key** (starts with `public_`)
   - **URL Endpoint** (format: `https://ik.imagekit.io/your_id`)

### Step 2: Add Credentials to .env File

Open the `.env` file in the root directory and replace these lines:

```env
# CHANGE THESE THREE LINES:
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key_here
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id

# TO YOUR ACTUAL VALUES:
IMAGEKIT_PRIVATE_KEY=private_abc123xyz...
IMAGEKIT_PUBLIC_KEY=public_xyz789abc...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/youraccountid
```

### Step 3: Restart Backend

```bash
# If backend is running, stop it (Ctrl+C)
# Then restart:
python main.py
```

## ✅ That's It!

You can now:
- ✅ Upload images when creating sweets (Admin)
- ✅ View images in the user shop
- ✅ See image thumbnails in admin inventory

## 🧪 Quick Test

1. **Login as Admin**
2. Click "Add New Sweet"
3. Fill in:
   - Name: Test Sweet
   - Category: Test
   - Price: 1.99
   - Stock: 10
   - **Click "📷 Choose Image"** → Select any image
4. Submit
5. ✅ See image in inventory table!

## 🎯 What Happens Without ImageKit Credentials?

If you haven't added your credentials yet:
- ❌ Image uploads will **fail**
- ✅ But sweets can still be created **without images**
- ✅ System shows emoji placeholder (🍭) instead

## 📚 Need Help?

- **Full Documentation:** See `docs/IMAGEKIT_SETUP.md`
- **Summary:** See `IMAGE_UPLOAD_SUMMARY.md`
- **ImageKit Help:** https://imagekit.io/support/

---

**Don't skip this step! Add your ImageKit credentials now! ⬆️**
