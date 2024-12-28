import { ReactNode } from 'react';
import BN from "bn.js";
import { HourglassAssociatedAccount, HourglassAuction, Message, UserAuctionAccount } from "../generated";
import { PublicKey } from "@solana/web3.js";
declare enum HourglassState {
    Loading = 0,
    Unavailable = 1,
    Auction = 2,
    Occupied = 3,
    GracePeriod = 4,
    Sunset = 5
}
type AccountWithPubkey<T> = {
    account: T;
    pubkey: PublicKey;
};
type HourglassContextData = {
    ownedHourglasses: AccountWithPubkey<HourglassAssociatedAccount>[];
    refetchOwnedHourglasses: (() => Promise<any>) | null;
    changeFocusedHourglass: ((hourglass: BN) => void) | null;
    focusedHourglass: BN | null;
    focusedHourglassData: HourglassAssociatedAccount | null;
    refetchFocusedHourglassData: (() => Promise<any>) | null;
    focusedHourglassAuction: HourglassAuction | null;
    refetchFocusedHourglassAuction: (() => Promise<any>) | null;
    focusedHourglassState: HourglassState | null;
    focusedHourglassAuctionBids: AccountWithPubkey<UserAuctionAccount>[];
    refetchFocusedHourglassAuctionBids: (() => Promise<any>) | null;
    focusedHourglassInvocations: AccountWithPubkey<Message>[];
    refetchFocusedHourglassInvocations: (() => Promise<any>) | null;
};
export default function HourglassProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
declare const useHourglass: () => HourglassContextData;
export { HourglassProvider, useHourglass };
