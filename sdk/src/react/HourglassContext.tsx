import {createContext, ReactNode, useCallback, useContext, useMemo, useState} from 'react';
import {Hourglass} from "../classes/Hourglass";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";
import {useQuery} from "@tanstack/react-query";
import BN from "bn.js";
import {HourglassAssociatedAccount, HourglassAuction, Message, UserAuctionAccount} from "../generated";
import {PublicKey} from "@solana/web3.js";

enum HourglassState {
    Loading,
    Unavailable,
    Auction,
    Occupied,
    GracePeriod,
    Sunset,
}

type AccountWithPubkey<T> = {
    account: T,
    pubkey: PublicKey
}

type HourglassContextData = {
    ownedHourglasses: AccountWithPubkey<HourglassAssociatedAccount>[],
    refetchOwnedHourglasses: (() => Promise<any>) | null,
    changeFocusedHourglass: ((hourglass: BN) => void) | null,
    focusedHourglass: BN | null,
    focusedHourglassData: HourglassAssociatedAccount | null,
    refetchFocusedHourglassData: (() => Promise<any>) | null,
    focusedHourglassAuction: HourglassAuction | null,
    refetchFocusedHourglassAuction: (() => Promise<any>) | null,
    focusedHourglassState: HourglassState | null,
    focusedHourglassAuctionBids: AccountWithPubkey<UserAuctionAccount>[],
    refetchFocusedHourglassAuctionBids: (() => Promise<any>) | null,
    focusedHourglassInvocations: AccountWithPubkey<Message>[],
    refetchFocusedHourglassInvocations: (() => Promise<any>) | null,
}

const defaultHourglassContext: HourglassContextData = {
    ownedHourglasses: [],
    refetchOwnedHourglasses: null,
    changeFocusedHourglass: null,
    focusedHourglass: null,
    focusedHourglassAuction: null,
    focusedHourglassAuctionBids: [],
    focusedHourglassData: null,
    focusedHourglassInvocations: [],
    focusedHourglassState: null,
    refetchFocusedHourglassAuction: null,
    refetchFocusedHourglassAuctionBids: null,
    refetchFocusedHourglassData: null,
    refetchFocusedHourglassInvocations: null
};

const HourglassContext = createContext<HourglassContextData>(defaultHourglassContext);

export default function HourglassProvider({ children }: { children: ReactNode }) {

    const {
        connection
    } = useConnection();

    const {
        publicKey
    } = useWallet();

    const protocol = useMemo(() => {
        return new Hourglass(
            connection
        );
    }, []);

    const {
        data: ownedHourglasses,
        refetch: refetchOwnedHourglasses,
        error: ownedHourglassesError,
        isLoading: ownedHourglassesLoading,
    } = useQuery({
        queryKey: ["ownedHourglasses"],
        enabled: !!publicKey,
        queryFn: () => protocol.getOwnedHourglasses(publicKey)
    });

    const [focusedHourglass, setFocusedHourglass] = useState<BN | null>();
    const {
        data: focusedHourglassData,
        refetch: refetchFocusedHourglassData,
        error: focusedHourglassError,
        isLoading: focusedHourglassLoading,
    } = useQuery({
        queryKey: ["focusedHourglass"],
        enabled: focusedHourglass !== null,
        queryFn: () => protocol.getHourglass(new BN(focusedHourglass))
    });

    const changeFocusedHourglass = useCallback((hourglass: BN) => {
        setFocusedHourglass(hourglass);
    }, [setFocusedHourglass]);

    const {
        data: focusedHourglassInvocations,
        refetch: refetchFocusedHourglassInvocations,
        error: focusedHourglassInvocationsError,
        isLoading: focusedHourglassInvocationsLoading,
    } = useQuery({
        queryKey: ["focusedHourglassInvocations"],
        enabled: focusedHourglass !== null,
        queryFn: () => protocol.getInvocations(focusedHourglass)
    });

    const {
        data: focusedHourglassAuction,
        refetch: refetchFocusedHourglassAuction,
        error: focusedHourglassAuctionError,
        isLoading: focusedHourglassAuctionLoading,
    } = useQuery({
        queryKey: ["focusedHourglassAuction"],
        // Can't be before the first auction.
        // If not owned by associated account, it's not in auction.
        enabled: new BN(focusedHourglassData.nextAuctionId.toString()).ltn(0)
            && focusedHourglassData.currentOwner
                .equals(Hourglass.deriveHourglassAssociatedAccount(focusedHourglass)),
        queryFn: () => protocol.getAuction(
            focusedHourglass,
            new BN(focusedHourglassData.nextAuctionId.toString()).subn(1)
        )
    });

    const {
        data: focusedHourglassAuctionBids,
        refetch: refetchFocusedHourglassAuctionBids,
        error: focusedHourglassAuctionBidsError,
        isLoading: focusedHourglassAuctionBidsLoading
    } = useQuery({
        queryKey: ["focusedHourglassAuctionBids"],
        enabled: new BN(focusedHourglassData.nextAuctionId.toString()).ltn(0),
        queryFn: () => protocol.getBids(
            focusedHourglass,
            new BN(focusedHourglassData.nextAuctionId.toString()).subn(1)
        )
    });

    const focusedHourglassState: HourglassState = useMemo(() => {
        if (focusedHourglassLoading) return HourglassState.Loading;

        const timestamp = new BN(Math.floor(Date.now() / 1000));

        // If is in ownership, it means in someone's wallet, not in auction.
        const isInOwnership = !focusedHourglassData
            .currentOwner
            .equals(Hourglass.deriveHourglassAssociatedAccount(focusedHourglass));

        if (isInOwnership) {
            const isOwnershipEnded = new BN(
                focusedHourglassData.ownedTill.toString()
            ).lt(timestamp);

            const isInGrace = new BN(
                focusedHourglassData.graceTill.toString()
            ).gt(timestamp);

            if (isOwnershipEnded && isInGrace) return HourglassState.GracePeriod;
            if (isOwnershipEnded) return HourglassState.Unavailable;
            return HourglassState.Occupied;
        }

        const isBeforeFirstAuction = new BN(focusedHourglassData.nextAuctionId).eqn(0);
        if (isBeforeFirstAuction) return HourglassState.Unavailable;

        if (focusedHourglassAuctionLoading) return HourglassState.Loading;

        // Means - last auction is not yet finished.
        const isInAuction = new BN(focusedHourglassAuction.ended).lt(timestamp);
        if (isInAuction) return HourglassState.Auction;
        return HourglassState.Unavailable;
    }, [focusedHourglassData, focusedHourglassAuction]);

    return (
        <HourglassContext.Provider
            value={{
                ownedHourglasses,
                refetchOwnedHourglasses,
                changeFocusedHourglass,
                focusedHourglass,
                focusedHourglassData,
                refetchFocusedHourglassData,
                focusedHourglassAuction,
                refetchFocusedHourglassAuction,
                focusedHourglassState,
                focusedHourglassAuctionBids,
                refetchFocusedHourglassAuctionBids,
                focusedHourglassInvocations,
                refetchFocusedHourglassInvocations,
            }}
        >
            { children }
        </HourglassContext.Provider>
    );
}

const useHourglass = () => {
    const context = useContext(HourglassContext);
    return context;
}

export {
    HourglassProvider,
    useHourglass
};