/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
import * as beet from '@metaplex-foundation/beet';
export type CreateHourglassArgs = {
    hourglassId: beet.bignum;
    name: string;
    symbol: string;
    metadataUri: string;
    description: string;
    image: string;
    creatorName: string;
    service: boolean[];
    isPublic: boolean;
    auctionLength: beet.bignum;
    ownershipPeriod: beet.bignum;
    gracePeriod: beet.bignum;
    minimumSalePrice: beet.bignum;
    minimumBid: beet.bignum;
    taxRate: beet.bignum;
    royalties: beet.bignum;
};
/**
 * @category userTypes
 * @category generated
 */
export declare const createHourglassArgsBeet: beet.FixableBeetArgsStruct<CreateHourglassArgs>;
