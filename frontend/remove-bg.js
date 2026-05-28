import { Jimp } from "jimp";

async function main() {
  const imagePath = './public/images/logo-light.png';
  console.log('Reading image from:', imagePath);
  
  const image = await Jimp.read(imagePath);
  
  // Tolerance for what is considered "white" (0-255)
  const tolerance = 240; 
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // If pixel is close to white, make it transparent
    if (r >= tolerance && g >= tolerance && b >= tolerance) {
      this.bitmap.data[idx + 3] = 0; // alpha to 0
    }
  });

  await image.write(imagePath);
  console.log('Background removed and saved successfully.');
}

main().catch(console.error);
