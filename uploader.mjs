import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import { config } from 'dotenv'
config()


const BUCKET = process.env.BUCKET
const s3 = new S3({
    credentials: {
        secretAccessKey: process.env.ACCESS_SECRET,
        accessKeyId: process.env.ACCESS_KEY,
    },
    region: process.env.REGION,
})

function upload(file) {
    const params = {
        Bucket: BUCKET,
        Key: `${Date.now()}.pdf`,
        Body: file,
        ACL: 'public-read',
    }

    return new Upload({
        client: s3,
        params
    }).done();
}

export default upload;
