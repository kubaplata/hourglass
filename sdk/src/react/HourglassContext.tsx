import {createContext, ReactNode, useMemo} from 'react';
import {Hourglass} from "../classes/Hourglass";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";

type HourglassContextData = {

}

const defaultHourglassContext: HourglassContextData = {};

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

    return (
        <HourglassContext.Provider
            value={{

            }}
        >
            { children }
        </HourglassContext.Provider>
    );
}