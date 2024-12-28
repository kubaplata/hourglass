"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHourglass = void 0;
exports.default = HourglassProvider;
exports.HourglassProvider = HourglassProvider;
exports.default = HourglassProvider;
exports.HourglassProvider = HourglassProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Hourglass_1 = require("../classes/Hourglass");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const react_query_1 = require("@tanstack/react-query");
const bn_js_1 = __importDefault(require("bn.js"));
var HourglassState;
(function (HourglassState) {
    HourglassState[HourglassState["Loading"] = 0] = "Loading";
    HourglassState[HourglassState["Unavailable"] = 1] = "Unavailable";
    HourglassState[HourglassState["Auction"] = 2] = "Auction";
    HourglassState[HourglassState["Occupied"] = 3] = "Occupied";
    HourglassState[HourglassState["GracePeriod"] = 4] = "GracePeriod";
    HourglassState[HourglassState["Sunset"] = 5] = "Sunset";
})(HourglassState || (HourglassState = {}));
const defaultHourglassContext = {
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
const HourglassContext = (0, react_1.createContext)(defaultHourglassContext);
function HourglassProvider({ children }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    const { publicKey } = (0, wallet_adapter_react_1.useWallet)();
    const protocol = (0, react_1.useMemo)(() => {
        return new Hourglass_1.Hourglass(connection);
    }, []);
    const { data: ownedHourglasses, refetch: refetchOwnedHourglasses, error: ownedHourglassesError, isLoading: ownedHourglassesLoading, } = (0, react_query_1.useQuery)({
        queryKey: ["ownedHourglasses"],
        enabled: !!publicKey,
        queryFn: () => protocol.getOwnedHourglasses(publicKey)
    });
    const [focusedHourglass, setFocusedHourglass] = (0, react_1.useState)();
    const { data: focusedHourglassData, refetch: refetchFocusedHourglassData, error: focusedHourglassError, isLoading: focusedHourglassLoading, } = (0, react_query_1.useQuery)({
        queryKey: ["focusedHourglass"],
        enabled: focusedHourglass !== null,
        queryFn: () => protocol.getHourglass(new bn_js_1.default(focusedHourglass))
    });
    const changeFocusedHourglass = (0, react_1.useCallback)((hourglass) => {
        setFocusedHourglass(hourglass);
    }, [setFocusedHourglass]);
    const { data: focusedHourglassInvocations, refetch: refetchFocusedHourglassInvocations, error: focusedHourglassInvocationsError, isLoading: focusedHourglassInvocationsLoading, } = (0, react_query_1.useQuery)({
        queryKey: ["focusedHourglassInvocations"],
        enabled: focusedHourglass !== null,
        queryFn: () => protocol.getInvocations(focusedHourglass)
    });
    const { data: focusedHourglassAuction, refetch: refetchFocusedHourglassAuction, error: focusedHourglassAuctionError, isLoading: focusedHourglassAuctionLoading, } = (0, react_query_1.useQuery)({
        queryKey: ["focusedHourglassAuction"],
        // Can't be before the first auction.
        // If not owned by associated account, it's not in auction.
        enabled: new bn_js_1.default(focusedHourglassData.nextAuctionId.toString()).ltn(0)
            && focusedHourglassData.currentOwner
                .equals(Hourglass_1.Hourglass.deriveHourglassAssociatedAccount(focusedHourglass)),
        queryFn: () => protocol.getAuction(focusedHourglass, new bn_js_1.default(focusedHourglassData.nextAuctionId.toString()).subn(1))
    });
    const { data: focusedHourglassAuctionBids, refetch: refetchFocusedHourglassAuctionBids, error: focusedHourglassAuctionBidsError, isLoading: focusedHourglassAuctionBidsLoading } = (0, react_query_1.useQuery)({
        queryKey: ["focusedHourglassAuctionBids"],
        enabled: new bn_js_1.default(focusedHourglassData.nextAuctionId.toString()).ltn(0),
        queryFn: () => protocol.getBids(focusedHourglass, new bn_js_1.default(focusedHourglassData.nextAuctionId.toString()).subn(1))
    });
    const focusedHourglassState = (0, react_1.useMemo)(() => {
        if (focusedHourglassLoading)
            return HourglassState.Loading;
        const timestamp = new bn_js_1.default(Math.floor(Date.now() / 1000));
        // If is in ownership, it means in someone's wallet, not in auction.
        const isInOwnership = !focusedHourglassData
            .currentOwner
            .equals(Hourglass_1.Hourglass.deriveHourglassAssociatedAccount(focusedHourglass));
        if (isInOwnership) {
            const isOwnershipEnded = new bn_js_1.default(focusedHourglassData.ownedTill.toString()).lt(timestamp);
            const isInGrace = new bn_js_1.default(focusedHourglassData.graceTill.toString()).gt(timestamp);
            if (isOwnershipEnded && isInGrace)
                return HourglassState.GracePeriod;
            if (isOwnershipEnded)
                return HourglassState.Unavailable;
            return HourglassState.Occupied;
        }
        const isBeforeFirstAuction = new bn_js_1.default(focusedHourglassData.nextAuctionId).eqn(0);
        if (isBeforeFirstAuction)
            return HourglassState.Unavailable;
        if (focusedHourglassAuctionLoading)
            return HourglassState.Loading;
        // Means - last auction is not yet finished.
        const isInAuction = new bn_js_1.default(focusedHourglassAuction.ended).lt(timestamp);
        if (isInAuction)
            return HourglassState.Auction;
        return HourglassState.Unavailable;
    }, [focusedHourglassData, focusedHourglassAuction]);
    return ((0, jsx_runtime_1.jsx)(HourglassContext.Provider, { value: {
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
        }, children: children }));
}
const useHourglass = () => {
    const context = (0, react_1.useContext)(HourglassContext);
    return context;
};
exports.useHourglass = useHourglass;
