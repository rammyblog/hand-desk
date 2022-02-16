declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PORT: string;
      REDIS_URL: string;
      SESSION_SECRET: string;
      JWT_EXPIRATION: string;
      CLOUDINARY_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_SECRET: string;
    }
  }
}

export {}
