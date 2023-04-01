import { useRouter } from 'next/router';

const WalletOptions = () => {
    const router = useRouter();

    const handleImportWallet = () => {
        router.push('/login');
    };

    const handleCreateNewWallet = () => {
        router.push('/keyManagement');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-md shadow-lg space-y-4">
                <h1 className="text-3xl font-semibold text-center">Wallet Options</h1>
                <button
                    onClick={handleImportWallet}
                    className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                    Import Wallet
                </button>
                <button
                    onClick={handleCreateNewWallet}
                    className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                >
                    Create New Wallet
                </button>
            </div>
        </div>
    );
};

export default WalletOptions;
