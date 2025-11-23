import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to upload images to our API endpoint
async function uploadImage(imagePath, houseNumber) {
  try {
    console.log(`Uploading ${imagePath} for house ${houseNumber}...`);
    
    // Read the file
    const imageBuffer = fs.readFileSync(imagePath);
    const filename = path.basename(imagePath);
    
    // Create form data
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('photo', blob, filename);
    formData.append('houseId', houseNumber.toString());
    
    // Upload to our API
    const response = await fetch('https://6f38e403.merry-rigged-mas.pages.dev/api/upload-photo', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Successfully uploaded house ${houseNumber}: ${result.imageUrl}`);
      return result.imageUrl;
    } else {
      console.error(`❌ Failed to upload house ${houseNumber}:`, result.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error uploading house ${houseNumber}:`, error.message);
    return null;
  }
}

// Main upload function
async function uploadAllImages() {
  const houseImagesDir = path.join(__dirname, 'House-Images');
  const files = fs.readdirSync(houseImagesDir);
  
  console.log(`Found ${files.length} images to upload:`);
  files.forEach(file => console.log(`  - ${file}`));
  console.log('\n');
  
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(houseImagesDir, file);
    
    // Extract house number from filename
    const match = file.match(/house-?(\d+)/i);
    if (!match) {
      console.log(`⚠️ Skipping ${file} - couldn't extract house number`);
      continue;
    }
    
    const houseNumber = parseInt(match[1]);
    const imageUrl = await uploadImage(filePath, houseNumber);
    
    if (imageUrl) {
      results.push({ houseNumber, imageUrl, filename: file });
    }
    
    // Add a small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Upload Summary:');
  console.log(`✅ Successful: ${results.length}`);
  console.log(`❌ Failed: ${files.length - results.length}`);
  
  if (results.length > 0) {
    console.log('\n🎯 Successfully uploaded:');
    results.forEach(({ houseNumber, imageUrl }) => {
      console.log(`  House ${houseNumber}: ${imageUrl}`);
    });
  }
}

// Run the upload
uploadAllImages().catch(console.error);