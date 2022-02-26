import {
  Resolver,
  Mutation,
  Arg,
  UseMiddleware,
  Ctx,
  Query,
} from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
import fs, { createWriteStream } from 'fs';
import { Upload } from '../types/Upload';
import { uploadToCloud, deleteFromCloud } from '../utils/cloudinary';
import path from 'path';
import { File } from '../entities/File';
import { isAuth } from '../middleware/isAuth';
import { User } from '../entities/User';
import { jwtVerify } from '../utils/jwtVerify';
import { MyContext } from '../types/context.types';

type cloudinaryResponse = {
  secure_url?: string;
  public_id?: string;
  error?: string;
};

@Resolver()
export class FileResolver {
  @Mutation(() => File)
  @UseMiddleware(isAuth)
  async addFile(
    @Arg('file', () => GraphQLUpload)
    { createReadStream, filename, mimetype }: Upload,
    @Ctx() { req }: MyContext
  ): Promise<File | string> {
    const filePath = path.join(__dirname, `../images/${filename}`);
    const acceptedTypes = ['image/jpeg', 'image/png'];
    if (acceptedTypes.indexOf(mimetype) !== -1) {
      const { secure_url, public_id }: cloudinaryResponse = await new Promise(
        async (resolve, reject) =>
          createReadStream()
            .pipe(createWriteStream(filePath))
            .once('close', () => {
              resolve(uploadToCloud(filePath));
              return;
            })
            .on('error', () => {
              reject(false);
              return;
            })
      );

      if (typeof secure_url === 'string') {
        fs.unlink(filePath, (err) => {
          if (err) throw err;
        });
        const user = await User.findOne(jwtVerify(req));
        return File.create({
          url: secure_url,
          publicId: public_id,
          user,
        }).save();
      } else {
        throw new Error('error uploading file');
      }
    }
    throw new Error('Unsupported file type.');
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteFile(@Arg('publicId') publicId: string): Promise<boolean> {
    await deleteFromCloud(publicId);
    await File.delete({ publicId });
    return true;
  }
  @Query(() => File)
  @UseMiddleware(isAuth)
  getFile(@Arg('id') id: string): Promise<File | undefined> {
    return File.findOne(id);
  }
}
