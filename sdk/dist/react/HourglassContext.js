"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HourglassProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Hourglass_1 = require("../classes/Hourglass");
const wallet_adapter_react_1 = require("@solana/wallet-adapter-react");
const defaultHourglassContext = {};
const HourglassContext = (0, react_1.createContext)(defaultHourglassContext);
function HourglassProvider({ children }) {
    const { connection } = (0, wallet_adapter_react_1.useConnection)();
    const { publicKey } = (0, wallet_adapter_react_1.useWallet)();
    const protocol = (0, react_1.useMemo)(() => {
        return new Hourglass_1.Hourglass(connection);
    }, []);
    return ((0, jsx_runtime_1.jsx)(HourglassContext.Provider, { value: {}, children: children }));
}
