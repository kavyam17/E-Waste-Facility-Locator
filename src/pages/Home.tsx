import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ArrowRight, Shield, Award, MapPin, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
              <Award className="h-4 w-4 mr-2" />
              Earn rewards for recycling
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Recycle Your E-Waste, <br />
              <span className="text-green-600">Earn Eco Credits.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg">
              EcoCycle helps you find authorized recycling centers and rewards you for your contribution to a greener planet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-200 group"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/awareness"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-green-100 to-emerald-50 p-8 flex items-center justify-center">
              <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Recycle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-24 w-full bg-green-50 rounded-xl border border-green-100 p-4 flex items-center space-x-4">
                    <div className="h-12 w-12 bg-green-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-2/3 bg-green-300 rounded" />
                      <div className="h-3 w-1/2 bg-green-200 rounded" />
                    </div>
                  </div>
                  <div className="h-24 w-full bg-gray-50 rounded-xl border border-gray-100 p-4 flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 bg-gray-300 rounded" />
                      <div className="h-3 w-1/3 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200" />
                    ))}
                  </div>
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-yellow-200 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-green-300 rounded-full blur-3xl opacity-30" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Three simple steps to make a difference and earn rewards.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Locate Facility",
              desc: "Find authorized e-waste collection centers near your location.",
              icon: MapPin,
              color: "bg-blue-500"
            },
            {
              title: "Dispose & Upload",
              desc: "Drop off your e-waste and upload a photo of the receipt or disposal.",
              icon: Upload,
              color: "bg-green-500"
            },
            {
              title: "Earn Credits",
              desc: "Once verified, earn credits that can be redeemed for exciting rewards.",
              icon: Award,
              color: "bg-yellow-500"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-6", feature.color)}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gray-900 rounded-3xl p-12 text-center text-white">
        <Shield className="h-12 w-12 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Authorized & Secure</h2>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          We only partner with government-authorized e-waste recyclers to ensure your data is destroyed safely and materials are recycled responsibly.
        </p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50">
          <span className="font-bold text-xl italic tracking-widest">ISO 14001</span>
          <span className="font-bold text-xl italic tracking-widest">R2 CERTIFIED</span>
          <span className="font-bold text-xl italic tracking-widest">E-STEWARDS</span>
        </div>
      </section>
    </div>
  );
};

export default Home;
