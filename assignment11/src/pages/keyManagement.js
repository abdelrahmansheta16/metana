import { useRouter } from 'next/router';
import React, { useState } from 'react';
import crypto from 'crypto';
const fse = require('fs-extra');
import createAccount from '@/utils/functions';

const KeyManagement = ({content}) => {
    const router = useRouter();
    const [newAccountName, setNewAccountName] = useState('');
    const [generatedKeyPair, setGeneratedKeyPair] = useState(null);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">Key Management</h1>
            </div>
        </div>
    );
};

export default KeyManagement;
