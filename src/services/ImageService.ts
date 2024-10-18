import { AVATAR_PATH } from "config/main";
import fileUpload from "express-fileupload";
import { mkdirp } from "mkdirp";
import sharp from "sharp";
import { ReturnToController } from "types/requestTypes";

export class ImageService {
    static async saveAvatar(
        file: fileUpload.UploadedFile,
        userId: number
    ): Promise<ReturnToController<string>> {
        mkdirp.sync(AVATAR_PATH + userId);
        await sharp(file.data)
            .resize(500, 500)
            .png()
            .toFile(AVATAR_PATH + userId + "/full.png");
        await sharp(file.data)
            .resize(50, 50)
            .png()
            .toFile(AVATAR_PATH + userId + "/mini.png");
        return {
            code: 201,
            data: "Аватар загружен",
        };
    }
}
