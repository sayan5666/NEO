const cloudinary = require('cloudinary').v2;

const isConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
};

if (isConfigured()) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config();
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

/**
 * Uploads a buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isConfigured()) {
      // Mock / fallback URL if Cloudinary API keys are not supplied in env
      const mockPublicId = `resumes/resume_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const mockUrl = `https://res.cloudinary.com/neo-intv/raw/upload/v${Date.now()}/${mockPublicId}.pdf`;
      return resolve({
        secure_url: mockUrl,
        public_id: mockPublicId,
        format: 'pdf',
        bytes: buffer.length,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'resumes',
        resource_type: 'raw',
        format: 'pdf',
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  isConfigured,
  uploadBufferToCloudinary,
};
