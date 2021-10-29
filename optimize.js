'use strict';

const AWS = require('aws-sdk'); //Não precisa instalar localmente, possui no lambda
const S3 = new AWS.S3();
const sharp = require('sharp');
const { basename } = require('path');
const { extname } = require('path/posix');

module.exports.handle = async ({ Records: records }, context) => {
 try {
    await Promise.all(records.map(async record => {
      //Caminho da imagem dentro do s3
      const { key } = record.s3.object;

      const image = await S3.getObject({
        Bucket: ProcessingInstruction.env.bucket,
        key
      }).promise();

    const optimized = await sharp(image.body)
      .resize(1280, 720, {fit: 'inside', withoutEnlargement: true})
      .toFormat('jpeg', { progressive: true, quality: 50})
      .toBuffer()

      await S3.putObject({
        Body: optimized,
        Bucket: process.env.bucket,
        ContentType: 'image/jpeg',
        Key: `compressed/${basename(key, extname(key))}.jpg`,
      }).promise();
  }));
  return {
    statusCode: 301,
    body: {success: true}
  }
 }catch(err){
   return err;
 }
};
