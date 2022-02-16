import { Resolver, Mutation, Arg } from 'type-graphql';
import { GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import fs, { Upload } from '../types/Upload';
import { uploadToCloud } from '../utils/cloudinary';
import path from 'path';

@Resolver()
export class FileResolver {
  @Mutation(() => String)
  async addFile(
    @Arg('file', () => GraphQLUpload)
    { createReadStream, filename, mimetype }: Upload
  ): Promise<string> {
    const filePath = path.join(__dirname, `../images/${filename}`);
    // const acceptedTypes = ['image/jpeg', 'image/png'];
    // if (acceptedTypes.indexOf(mimetype) !== -1) {
    //   const stream = createReadStream();
    //   stream.pipe(createWriteStream(filePath));

    //   let a = await stream.once('close', () => {
    //     console.log('here');
    //     const secureURL = uploadToCloud(filePath);
    //     console.log(secureURL);
    //     return secureURL;
    //   });
    //   a = Promise.all(a);
    //   return a;
    // }
    // throw new Error('Unsupported image type.');
    const a = new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(filePath))
        .once('close', () => {
          const secureURL = uploadToCloud(filePath);
          //   fs.unlinkSync(filePath);
          resolve(secureURL);
        })
        .on('error', (err) => {
          console.log('error');
          console.log(err);
          reject(false);
        })
    );
    return a;
  }
}
