# Image Upload & Editing Features Guide

## 🎨 Overview

The PicCur platform now includes comprehensive image upload, editing, and album building capabilities - all running entirely in the frontend using browser APIs.

## 📤 Image Upload System

### Features
- **Drag & Drop Upload**: Simply drag images into the upload area
- **File Browser**: Click to browse and select multiple images
- **Batch Upload**: Upload up to 50-200 images at once (configurable)
- **Local Storage**: All images stored in browser IndexedDB (no backend needed)
- **Image Library**: View and manage all uploaded images

### Usage
1. Navigate to "Create Album" as an editor
2. After filling the form, you'll see the album builder
3. Use the image uploader in the left sidebar
4. Drag images or click to browse
5. Images are automatically saved to your local library

## ✏️ Image Editor

### Available Tools

#### 1. **Rotation**
- Rotate images 0-360 degrees
- Quick buttons for 90° left/right
- Smooth rotation with live preview

#### 2. **Zoom**
- Scale from 50% to 200%
- Real-time zoom preview
- Maintains image quality

#### 3. **Brightness**
- Adjust from 0% to 200%
- Perfect for exposure correction

#### 4. **Contrast**
- Enhance or reduce contrast (0-200%)
- Make images pop or soften them

#### 5. **Saturation**
- Control color intensity (0-200%)
- Create vibrant or muted looks

#### 6. **Filters**
- **Grayscale**: Classic black & white
- **Sepia**: Vintage warm tone
- **Vintage**: Aged photo effect
- **None**: Original colors

### How to Edit
1. In Manual Album Builder, click the edit icon on any image
2. Image editor opens in full-screen modal
3. Adjust sliders and see live preview
4. Click "Save" to apply changes
5. Click "Reset" to revert to original

## 🎨 Manual Album Builder

### Features
- **Drag & Drop Layout**: Position images anywhere on the page
- **Multi-Page Support**: Add unlimited pages
- **Image Library**: Access all uploaded images
- **Live Editing**: Edit images directly from the canvas
- **Page Thumbnails**: Quick navigation between pages
- **Resize & Rotate**: Adjust image size and rotation

### Workflow
1. Upload images using the uploader
2. Click an image from the library to add it to the current page
3. Drag images to reposition them
4. Click edit icon to modify an image
5. Add new pages as needed
6. Save your album when complete

### Tips
- Images can be positioned anywhere on the 800x600 canvas
- Use the page thumbnails on the right to navigate
- Edit images by clicking the edit icon that appears on hover
- Remove images with the trash icon

## 🤖 Automated Album Builder

### Features
- **Predefined Layouts**: Automatic page arrangements
- **Smart Distribution**: Images distributed across pages
- **Cover Pages**: Automatic front and back cover
- **Layout Templates**: 
  - Single image
  - Two column
  - Three column
  - 2x2 Grid
  - Mixed layouts

### Workflow
1. Upload images (or use existing library)
2. Select images by clicking (shows selection number)
3. Select exactly the number of images for your configuration:
   - 16+2 cover = 50 images
   - 20+2 cover = 62 images
   - 30+2 cover = 92 images
   - 40+2 cover = 122 images
4. Click "Generate Album"
5. Preview the automatically arranged pages
6. Save when satisfied

### Configuration Options
- **Album Sizes**: 10×10, 12×12, 11×14 (portrait), 14×11 (landscape)
- **Page Configurations**: Choose based on image count
- **Automatic Layout**: System arranges images optimally

## 💾 Local Storage (IndexedDB)

### What's Stored
- **Images**: All uploaded images with metadata
- **Albums**: Complete album data including pages and layouts
- **No Backend Required**: Everything runs in the browser

### Storage Limits
- Browser-dependent (typically 50-100MB+)
- Images stored as base64 data URLs
- Automatic cleanup recommended for large projects

### Accessing Stored Data
- Images persist across browser sessions
- Albums saved automatically
- Can be exported/imported (future feature)

## 🔧 Technical Details

### Technologies Used
- **IndexedDB**: Browser database for storage
- **Canvas API**: Image editing and manipulation
- **FileReader API**: Image file reading
- **Drag & Drop API**: Manual layout positioning
- **React Hooks**: State management

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires IndexedDB support
- Canvas API for editing features

## 🚀 Quick Start

1. **As Editor**:
   - Login with editor account
   - Go to "Create Album"
   - Fill in album details
   - Choose Manual or Automated
   - Upload and edit images
   - Build your album
   - Save

2. **Image Editing**:
   - Click edit icon on any image
   - Adjust sliders for desired effect
   - Save changes
   - Continue building

3. **Manual Building**:
   - Add images from library to pages
   - Drag to position
   - Edit as needed
   - Add more pages
   - Save album

4. **Automated Building**:
   - Upload images
   - Select required number
   - Generate album
   - Review and save

## 📝 Notes

- All data is stored locally in your browser
- Images are not uploaded to any server
- Works completely offline after initial load
- Clear browser data will remove all albums/images
- For production, integrate with backend storage

---

**Enjoy building beautiful albums!** 🎉

