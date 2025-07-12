import { DroidUser } from 'miko-modules';

declare abstract class DroidCard {
    static create(user: DroidUser): Promise<Buffer<ArrayBufferLike>>;
    private static getCardBuffer;
}

export { DroidCard };
