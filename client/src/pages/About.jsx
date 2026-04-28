import React from 'react';

 function About() {
  return (
    <div className="py-20 px-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          About Nest Quest
        </h1>
        <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-3xl mx-auto">
          Where dreams find a home – your journey begins with us.
        </p>
      </div>

      {/* Content Section */}
      <div className="space-y-6 text-gray-700 text-justify leading-relaxed text-base sm:text-lg">
        <p>
          <strong>Nest Quest</strong> is a leading real estate agency that specializes in helping clients buy, sell, and rent properties in the most desirable neighborhoods. Our team of experienced agents is dedicated to providing exceptional service and making the buying and selling process as smooth as possible.
        </p>

        <p>
          Our mission is to empower you in your real estate journey by offering expert advice, personalized service, and a deep understanding of the local market. Whether you’re looking for your first home, an investment property, or a luxury estate, we're here to guide you every step of the way.
        </p>

        <p>
          With decades of combined experience, our agents are passionate, knowledgeable, and committed to excellence. We believe that finding or selling a home should be a rewarding and exciting experience — and we make it our job to ensure that it is.
        </p>
      </div>
    </div>
  );
}
export default About;
