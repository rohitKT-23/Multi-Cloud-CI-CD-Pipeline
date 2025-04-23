import React from "react";
import { Cloud, Users, Code, Globe } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">About MultiCloud</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            We're revolutionizing the way teams deploy and manage applications across multiple cloud providers.
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="card">
              <div className="flex items-center mb-6">
                <Cloud className="h-8 w-8 text-blue-600" />
                <h2 className="ml-3 text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-gray-600">
                To simplify cloud deployment and management by providing a unified platform that seamlessly integrates with multiple cloud providers, enabling teams to focus on innovation rather than infrastructure.
              </p>
            </div>

            <div className="card">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
                <h2 className="ml-3 text-2xl font-bold text-gray-900">Our Team</h2>
              </div>
              <p className="text-gray-600">
                We're a team of passionate cloud engineers and developers dedicated to creating the best multi-cloud deployment experience for businesses of all sizes.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose MultiCloud?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <Code className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced CI/CD Pipeline</h3>
              <p className="text-gray-600">
                Our platform provides state-of-the-art continuous integration and deployment capabilities, ensuring your code is always production-ready.
              </p>
            </div>

            <div className="card">
              <Globe className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Infrastructure</h3>
              <p className="text-gray-600">
                Deploy your applications globally with just a few clicks, leveraging the power of multiple cloud providers.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get Started Today</h2>
          <button className="btn btn-primary">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;