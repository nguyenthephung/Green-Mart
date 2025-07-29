import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, StarIcon } from '@heroicons/react/24/solid';

interface Testimonial {
  id: number;
  name: string;
  image: string;
  text: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => (
  <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-900 dark:to-gray-800 py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-6">
          <SparklesIcon className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-gray-700 dark:text-gray-300">Khách Hàng Nói Gì?</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
          Câu Chuyện Thành Công
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
          Hàng nghìn khách hàng đã tin tưởng và yêu thích GreenMart
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id} 
            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl hover:shadow-2xl dark:shadow-gray-900/50 transition-all duration-300 border border-emerald-100 dark:border-gray-700 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-bl-full opacity-50"></div>
            <div className="absolute top-6 left-6 text-emerald-200">
              <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.17 6.17A7.001 7.001 0 0 0 2 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1c0-1.306-.835-2.417-2.03-2.83A5.001 5.001 0 0 1 7.17 6.17zm9.66 0A7.001 7.001 0 0 0 11.66 13a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1c0-1.306-.835-2.417-2.03-2.83A5.001 5.001 0 0 1 16.83 6.17z"/>
              </svg>
            </div>
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="relative">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-16 h-16 rounded-full object-cover border-4 border-emerald-200 shadow-lg" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{testimonial.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Khách hàng thân thiết</span>
                </div>
              </div>
            </div>
            <blockquote className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic relative z-10">
              "{testimonial.text}"
            </blockquote>
            <div className="mt-6 pt-6 border-t border-emerald-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Đánh giá tổng thể</span>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">5.0</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Tham Gia Cộng Đồng</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Hơn 10,000+ khách hàng hài lòng</p>
          <Link 
            to="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform duration-300"
          >
            Đăng Ký Ngay
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default TestimonialsSection;
