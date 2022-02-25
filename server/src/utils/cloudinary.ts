import cloud from 'cloudinary';

export const uploadToCloud = async (image: string) => {
  const cloudinary = cloud.v2;
  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(image);
    return { secure_url, public_id };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteFromCloud = async (public_id: string) => {
  const cloudinary = cloud.v2;
  try {
    await cloudinary.uploader.destroy(public_id, { invalidate: true });
    return true;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
