import React from 'react';
import { Info, AlertTriangle, Lightbulb, ShieldCheck, ExternalLink, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

const Awareness: React.FC = () => {
  const articles = [
    {
      title: "What is E-Waste?",
      desc: "Electronic waste or e-waste describes discarded electrical or electronic devices. Used electronics which are destined for refurbishment, reuse, resale, salvage recycling through material recovery, or disposal are also considered e-waste.",
      icon: Info,
      color: "bg-blue-500"
    },
    {
      title: "Hazards of Improper Disposal",
      desc: "E-waste contains toxic materials like lead, mercury, and cadmium. If not disposed of properly, these chemicals can leak into the soil and water, causing severe health issues and environmental damage.",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      title: "Recycling Tips",
      desc: "Always back up your data and perform a factory reset before recycling. Remove batteries if possible, as they often require separate handling. Don't throw electronics in the regular trash!",
      icon: Lightbulb,
      color: "bg-yellow-500"
    },
    {
      title: "Government Guidelines",
      desc: "Many countries have strict E-Waste Management Rules. Authorized recyclers must follow specific protocols for collection, storage, and processing to ensure zero-landfill goals.",
      icon: ShieldCheck,
      color: "bg-green-500"
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">E-Waste Awareness</h1>
        <p className="text-xl text-gray-600">
          Knowledge is the first step towards a sustainable future. Learn why recycling your electronics matters.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {articles.map((article, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 ${article.color}`}>
              <article.icon className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h3>
            <p className="text-gray-600 leading-relaxed">{article.desc}</p>
          </motion.div>
        ))}
      </div>

      <section className="bg-green-600 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-6">Did You Know?</h2>
          <ul className="space-y-4 text-green-50">
            <li className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Only about 20% of global e-waste is formally recycled.</p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>E-waste represents 2% of America's trash in landfills, but it equals 70% of overall toxic waste.</p>
            </li>
            <li className="flex items-start space-x-3">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Recycling 1 million laptops saves the energy equivalent to the electricity used by 3,657 U.S. homes in a year.</p>
            </li>
          </ul>
        </div>
        <BookOpen className="absolute -right-10 -bottom-10 h-64 w-64 text-green-500 opacity-20" />
      </section>

      
    </div>
  );
};

export default Awareness;
