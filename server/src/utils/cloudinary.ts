import cloud from 'cloudinary';

export const uploadToCloud = async (image: string) => {
  const cloudinary = cloud.v2;
  // cloudinary configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
  try {
    const { secure_url } = await cloudinary.uploader.upload(image);
    return secure_url;
  } catch (error) {
    console.log(error)
    throw error;
  }
};
