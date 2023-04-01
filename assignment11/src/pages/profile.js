import React, { useState } from 'react';

const UserProfile = () => {
    const [username, setUsername] = useState('JohnDoe');
    const [email, setEmail] = useState('johndoe@example.com');

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const saveChanges = () => {
        // Replace this with actual logic to save user profile changes
        console.log(`Saving changes for user: Username=${username}, Email=${email}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-8 max-w-md w-full space-y-4 bg-white shadow-lg rounded-md">
                <h1 className="text-3xl font-semibold text-center">User Profile</h1>

                {/* Username */}
                <div>
                    <p className="text-lg font-bold">Username</p>
                    <input
                        type="text"
                        value={username}
                        onChange={handleUsernameChange}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                </div>

                {/* Email */}
                <div>
                    <p className="text-lg font-bold">Email</p>
                    <input
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    />
                </div>

                {/* Save Changes Button */}
                <button
                    onClick={saveChanges}
                    className="w-full bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
