import { Resolver, Mutation, Arg, UseMiddleware, Ctx } from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
import fs, { createWriteStream } from 'fs';
import { Upload } from '../types/Upload';
import { uploadToCloud } from '../utils/cloudinary';
import path from 'path';
import { File } from '../entities/File';
import { isAuth } from '../middleware/isAuth';
import { User } from '../entities/User';
import { jwtVerify } from '../utils/jwtVerify';
import { MyContext } from '../types/context.types';

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
      const secureURL: Promise<string | boolean> = new Promise(
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

      const URL: string | boolean = await secureURL;
      if (typeof URL === 'string') {
        fs.unlink(filePath, (err) => {
          if (err) throw err;
        });
        const user = await User.findOne(jwtVerify(req));
        return File.create({ url: URL, user }).save();
      } else {
        throw new Error('error uploading file');
      }
    }
    throw new Error('Unsupported file type.');
  }
}
