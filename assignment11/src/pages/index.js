import React from 'react';

const Home = () => {

  return (
    <div>
      {!isNew ? (
        <div className="min-h-screen bg-gray-100">
          {/* Navigation Bar */}
          <div className="bg-blue-500 p-4 flex justify-between items-center">
            <div className="flex space-x-2">
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};


export default Home;
