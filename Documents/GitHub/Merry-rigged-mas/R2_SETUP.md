# 📷 R2 Photo Storage Setup

This document explains how to set up and use R2 storage for house photos in the Christmas Lights voting app.

## 🪣 R2 Bucket Configuration

### Bucket Details
- **Name**: `christmas-lights-photos`
- **Binding**: `PHOTOS`
- **Purpose**: Store uploaded house photos with metadata

### Created Resources
- ✅ R2 bucket created
- ✅ wrangler.toml updated with binding
- ✅ API endpoints created for upload and listing
- ✅ Type definitions added to all function files

## 🔧 API Endpoints

### Upload Photo
**POST** `/api/upload-photo`

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `photo` (File): Image file (max 5MB, images only)
- `houseId` (string): ID of the house

**Response**:
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "imageUrl": "https://pub-house-7-1700000000000.jpg",
  "fileKey": "house-7-1700000000000.jpg"
}
```

### List Photos
**GET** `/api/list-photos?houseId=7&limit=10`

**Query Parameters**:
- `houseId` (optional): Filter by house ID
- `limit` (optional): Max results (default: 50, max: 100)

**Response**:
```json
{
  "success": true,
  "photos": [
    {
      "key": "house-7-1700000000000.jpg",
      "size": 1024000,
      "uploaded": "2025-11-23T09:00:00.000Z",
      "url": "https://pub-house-7-1700000000000.jpg",
      "metadata": {
        "houseId": "7",
        "originalName": "christmas-lights.jpg",
        "uploadedAt": "2025-11-23T09:00:00.000Z"
      }
    }
  ],
  "count": 1,
  "truncated": false
}
```

## 🌐 Public Access Setup

### Option 1: R2 Custom Domain (Recommended)
1. Go to Cloudflare Dashboard → R2 Object Storage
2. Select `christmas-lights-photos` bucket
3. Go to Settings → Custom Domains
4. Add custom domain (e.g., `photos.your-domain.com`)
5. Update API endpoints to use custom domain

### Option 2: R2.dev Subdomain
1. Go to bucket settings
2. Enable public access
3. Use R2.dev subdomain for public URLs

### Update URLs
Once public access is configured, update the URL generation in:
- `upload-photo.ts` (line 143)
- `list-photos.ts` (line 75)

Replace:
```typescript
const imageUrl = `https://pub-${fileKey}`;
```

With:
```typescript
const imageUrl = `https://your-bucket-domain.com/${fileKey}`;
```

## 🖼️ File Storage Structure

### File Naming Convention
- Format: `house-{houseId}-{timestamp}.{extension}`
- Example: `house-7-1700000000000.jpg`

### Metadata Stored
- `houseId`: Which house the photo belongs to
- `originalName`: Original filename from user
- `uploadedAt`: ISO timestamp of upload

### File Validation
- ✅ Image files only (`image/*` MIME types)
- ✅ Maximum 5MB file size
- ✅ Automatic file extension detection
- ✅ Unique filename generation

## 🔒 Security Features

### Input Validation
- Content-Type validation for multipart/form-data
- File type validation (images only)
- File size limits (5MB max)
- House ID validation
- SQL injection prevention

### Error Handling
- Graceful R2 upload failures
- Database rollback on update failures
- Automatic cleanup of failed uploads
- Detailed error messages

## 📱 Integration with Frontend

### Example Upload Form
```typescript
const uploadPhoto = async (file: File, houseId: number) => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('houseId', houseId.toString());
  
  const response = await fetch('/api/upload-photo', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

### Example Photo Gallery
```typescript
const loadPhotos = async (houseId?: number) => {
  const url = new URL('/api/list-photos', window.location.origin);
  if (houseId) url.searchParams.set('houseId', houseId.toString());
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.photos;
};
```

## 🚀 Deployment Notes

The R2 bucket and bindings are configured for both development and production environments in `wrangler.toml`. The bucket will be available immediately after deployment.

## 💡 Future Enhancements

- Image resizing/optimization
- Multiple image formats support
- Photo moderation/approval workflow
- EXIF data handling
- Bulk upload capabilities
- Photo rotation/editing features