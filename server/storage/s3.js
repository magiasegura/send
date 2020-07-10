const AWS = require('aws-sdk');

const config = {};
if (typeof process.env.AWS_S3_ENDPOINT !== 'undefined') {
  config['endpoint'] = process.env.AWS_S3_ENDPOINT;
}
if (typeof process.env.AWS_S3_USE_PATH_STYLE_ENDPOINT !== 'undefined') {
  config['s3ForcePathStyle'] =
    process.env.AWS_S3_USE_PATH_STYLE_ENDPOINT == 'true' ? true : false;
}
if (typeof process.env.AWS_S3_SIGNATURE_VERSION !== 'undefined') {
  config['signatureVersion'] = process.env.AWS_S3_SIGNATURE_VERSION;
}
AWS.config.update(config);

const s3 = new AWS.S3();

class S3Storage {
  constructor(config, log) {
    this.bucket = config.s3_bucket;
    this.log = log;
  }

  async length(id) {
    const result = await s3
      .headObject({ Bucket: this.bucket, Key: id })
      .promise();
    return result.ContentLength;
  }

  getStream(id) {
    return s3.getObject({ Bucket: this.bucket, Key: id }).createReadStream();
  }

  set(id, file) {
    const upload = s3.upload({
      Bucket: this.bucket,
      Key: id,
      Body: file
    });
    file.on('error', () => upload.abort());
    return upload.promise();
  }

  del(id) {
    return s3.deleteObject({ Bucket: this.bucket, Key: id }).promise();
  }

  ping() {
    return s3.headBucket({ Bucket: this.bucket }).promise();
  }
}

module.exports = S3Storage;
