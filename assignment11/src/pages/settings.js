import React, { useState } from 'react';

const Settings = () => {
    const [securitySettings, setSecuritySettings] = useState({
        enable2FA: false,
        usePIN: false,
        useBiometrics: false,
    });
    const [networkSettings, setNetworkSettings] = useState({
        blockchainNetwork: 'Ethereum',
        customRPC: '',
    });

    const handle2FAChange = () => {
        setSecuritySettings((prevSettings) => ({
            ...prevSettings,
            enable2FA: !prevSettings.enable2FA,
        }));
    };

    const handlePINChange = () => {
        setSecuritySettings((prevSettings) => ({
            ...prevSettings,
            usePIN: !prevSettings.usePIN,
        }));
    };

    const handleBiometricsChange = () => {
        setSecuritySettings((prevSettings) => ({
            ...prevSettings,
            useBiometrics: !prevSettings.useBiometrics,
        }));
    };

    const handleNetworkChange = (event) => {
        setNetworkSettings({
            ...networkSettings,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Settings</h1>

                {/* Security Settings */}
                <div>
                    <p className="text-lg font-bold">Security Settings</p>
                    <label className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            checked={securitySettings.enable2FA}
                            onChange={handle2FAChange}
                            className="mr-2"
                        />
                        Enable Two-Factor Authentication
                    </label>
                    <label className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            checked={securitySettings.usePIN}
                            onChange={handlePINChange}
                            className="mr-2"
                        />
                        Use PIN for Wallet Access
                    </label>
                    <label className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            checked={securitySettings.useBiometrics}
                            onChange={handleBiometricsChange}
                            className="mr-2"
                        />
                        Use Biometrics for Wallet Access
                    </label>
                </div>

                {/* Network Settings */}
                <div>
                    <p className="text-lg font-bold">Network Settings</p>
                    <select
                        name="blockchainNetwork"
                        value={networkSettings.blockchainNetwork}
                        onChange={handleNetworkChange}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    >
                        <option value="Ethereum">Ethereum</option>
                        <option value="Custom">Custom</option>
                    </select>
                    {networkSettings.blockchainNetwork === 'Custom' && (
                        <input
                            type="text"
                            name="customRPC"
                            placeholder="Custom RPC URL"
                            value={networkSettings.customRPC}
                            onChange={handleNetworkChange}
                            className="w-full p-2 border border-gray-300 rounded-md mt-2"
                        />
                    )
                    }
                </div>
            </div>
        </div>
    );
};

export default Settings;
