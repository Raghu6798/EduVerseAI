"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Computer Science Student",
    image:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    quote:
      "ScholarAI helped me understand complex algorithms from my lecture recordings that I was struggling with for weeks.",
    stars: 5,
  },
  {
    name: "Sophia Chen",
    role: "Biology Major",
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    quote:
      "I uploaded my biochemistry textbook and could ask specific questions about pathways that weren't clear in class.",
    stars: 5,
  },
  {
    name: "Marco Rodriguez",
    role: "Engineering Student",
    image:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    quote:
      "The image analysis feature made understanding complex diagrams so much easier. A game changer for visual learners!",
    stars: 4,
  },
  {
    name: "Priya Patel",
    role: "Medical Student",
    image:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    quote:
      "ScholarAI has transformed how I study for anatomy exams by helping me visualize and understand complex systems.",
    stars: 5,
  },
]

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            What Students Are Saying
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Don't just take our word for it. See how ScholarAI is helping students achieve their academic goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-purple-100 mr-3">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <Quote className="h-8 w-8 text-purple-300 dark:text-purple-700" />
              </div>

              <p className="mb-4 text-slate-600 dark:text-slate-300">"{testimonial.quote}"</p>

              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.stars ? "fill-amber-400" : "fill-slate-200 dark:fill-slate-700"}`}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
