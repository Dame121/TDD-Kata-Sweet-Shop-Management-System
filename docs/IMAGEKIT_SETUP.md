# ImageKit.io Integration Guide

## 🎯 Overview

The Sweet Shop Management System now supports image uploads for sweets using **ImageKit.io**, a powerful image CDN and optimization service.

## 📋 Setup Instructions

### Step 1: Create ImageKit Account

1. Go to [https://imagekit.io/](https://imagekit.io/)
2. Sign up for a free account
3. After signup, go to **Developer Options** in your dashboard

### Step 2: Get Your Credentials

From the ImageKit Dashboard → Developer Options, you'll need:

1. **Private Key** - Used for server-side operations
2. **Public Key** - Used for client-side access
3. **URL Endpoint** - Your unique ImageKit URL (format: `https://ik.imagekit.io/your_imagekit_id`)

### Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory (if not exists):
   ```bash
   cp .env.example .env
   ```

2. Add your ImageKit credentials to `.env`:
   ```env
   IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxx
   IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxx
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
   ```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install `imagekitio==3.2.0` package.

### Step 5: Run Database Migration

```bash
python scripts/add_image_support.py
```

This adds `image_url` and `image_id` columns to the sweets table.

## 🔧 API Endpoints

### 1. Create Sweet with Image (Admin)

**POST** `/api/sweets/`

**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Form Data:**
- `name` (string, required): Sweet name
- `category` (string, required): Sweet category
- `price` (float, required): Sweet price
- `quantity_in_stock` (int, optional, default=0): Initial stock
- `image` (file, optional): Image file (JPEG, PNG, GIF, WEBP, max 5MB)

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/api/sweets/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Chocolate Bar" \
  -F "category=Chocolate" \
  -F "price=2.99" \
  -F "quantity_in_stock=50" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "sweet_id": 1,
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 2.99,
  "quantity_in_stock": 50,
  "image_url": "https://ik.imagekit.io/your_id/sweets/sweet_Chocolate_Bar_image.jpg",
  "image_id": "file_abc123xyz"
}
```

### 2. Update Sweet Image (Admin)

**PUT** `/api/sweets/{sweet_id}/image`

**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Form Data:**
- `image` (file, required): New image file

**Example:**
```bash
curl -X PUT "http://localhost:8000/api/sweets/1/image" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/new_image.jpg"
```

### 3. Delete Sweet Image (Admin)

**DELETE** `/api/sweets/{sweet_id}/image`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example:**
```bash
curl -X DELETE "http://localhost:8000/api/sweets/1/image" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get All Sweets (includes image URLs)

**GET** `/api/sweets/`

**Response includes image URLs:**
```json
[
  {
    "sweet_id": 1,
    "name": "Chocolate Bar",
    "category": "Chocolate",
    "price": 2.99,
    "quantity_in_stock": 50,
    "image_url": "https://ik.imagekit.io/your_id/sweets/sweet_Chocolate_Bar_image.jpg",
    "image_id": "file_abc123xyz"
  }
]
```

## 📝 Features

### Image Upload Features

- ✅ **Multiple formats supported**: JPEG, JPG, PNG, GIF, WEBP
- ✅ **File size limit**: Maximum 5MB per image
- ✅ **Automatic optimization**: ImageKit optimizes images automatically
- ✅ **CDN delivery**: Fast image delivery worldwide
- ✅ **Unique file names**: Prevents naming conflicts
- ✅ **Organized storage**: All images stored in `/sweets/` folder

### Image Management

- ✅ **Upload on create**: Add image when creating a sweet
- ✅ **Update image**: Replace existing image
- ✅ **Delete image**: Remove image while keeping sweet
- ✅ **Auto-deletion**: Images deleted when sweet is deleted
- ✅ **Error handling**: Graceful handling of upload failures

## 🎨 Image Transformations

ImageKit supports real-time image transformations. You can modify URLs for different sizes:

**Original:**
```
https://ik.imagekit.io/your_id/sweets/image.jpg
```

**Thumbnail (200x200):**
```
https://ik.imagekit.io/your_id/tr:w-200,h-200/sweets/image.jpg
```

**Optimized for web:**
```
https://ik.imagekit.io/your_id/tr:w-800,h-800,q-80/sweets/image.jpg
```

Common transformations:
- `w-{width}` - Set width
- `h-{height}` - Set height
- `q-{quality}` - Set quality (1-100)
- `f-auto` - Auto format selection
- `ar-{ratio}` - Aspect ratio

## 🔒 Security

- ✅ **Admin-only uploads**: Only admins can upload/modify images
- ✅ **File type validation**: Only image files accepted
- ✅ **Size validation**: Prevents large file uploads
- ✅ **Private key security**: Private key stored in environment variables
- ✅ **Automatic cleanup**: Orphaned images cleaned up on deletion

## 🐛 Troubleshooting

### Error: "ImageKit credentials not found"

**Solution:** Make sure your `.env` file has all three ImageKit variables:
```env
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_URL_ENDPOINT=...
```

### Error: "Invalid file type"

**Solution:** Only upload JPEG, PNG, GIF, or WEBP images.

### Error: "File size too large"

**Solution:** Compress your image to be under 5MB.

### Error: "Failed to upload image to ImageKit"

**Solution:** 
1. Check your ImageKit credentials are correct
2. Verify your ImageKit account is active
3. Check your internet connection

### Images not showing in frontend

**Solution:**
1. Ensure the backend is returning `image_url` in responses
2. Check browser console for CORS errors
3. Verify the ImageKit URL endpoint is correct

## 📊 ImageKit Dashboard

Monitor your usage:
1. Go to [ImageKit Dashboard](https://imagekit.io/dashboard)
2. View:
   - **Media Library**: All uploaded images
   - **Usage**: Storage and bandwidth usage
   - **Analytics**: Image delivery stats

## 💡 Best Practices

1. **Optimize before upload**: Resize images to reasonable dimensions (e.g., 1200x1200 max)
2. **Use appropriate formats**: JPEG for photos, PNG for graphics with transparency
3. **Lazy loading**: Use lazy loading in frontend for better performance
4. **Responsive images**: Use ImageKit transformations for different screen sizes
5. **Alt text**: Always provide descriptive alt text for accessibility

## 🔄 Migration Notes

If you have existing sweets in your database:
- They will have `null` values for `image_url` and `image_id`
- You can update them later using the update image endpoint
- No data loss occurs during migration

## 📚 Additional Resources

- [ImageKit Documentation](https://docs.imagekit.io/)
- [ImageKit Python SDK](https://github.com/imagekit-developer/imagekit-python)
- [Image Optimization Guide](https://imagekit.io/blog/image-optimization/)

## 🎉 Free Tier Limits

ImageKit Free Plan includes:
- ✅ 20GB bandwidth/month
- ✅ 20GB media storage
- ✅ Unlimited transformations
- ✅ Real-time image optimization
- ✅ CDN delivery

Perfect for development and small to medium projects!

---

**Need Help?** Check the [ImageKit Support](https://imagekit.io/support/) or create an issue in the repository.
