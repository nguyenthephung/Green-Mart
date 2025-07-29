import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  category: string;
}

interface HeroSectionProps {
  realSlides: Slide[];
  currentSlide: number;
  setCurrentSlide: (idx: number) => void;
  isScrolling: boolean;
  backgroundImage?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ realSlides, currentSlide, setCurrentSlide, isScrolling, backgroundImage }) => (
  <div
    className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden mb-16 carousel-container"
    style={{
      marginTop: 0,
      paddingTop: 0,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: backgroundImage ? 'cover' : undefined,
      backgroundPosition: backgroundImage ? 'center' : undefined,
      filter: backgroundImage ? 'brightness(0.9) contrast(1.1)' : undefined,
      transition: 'background-image 1s cubic-bezier(.4,1.6,.6,1)'
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-green-900/30 z-10"></div>
    {/* Các slide nhỏ vẫn giữ để hiệu ứng chuyển động mượt */}
    {realSlides.map((slide, index) => (
      <div
        key={slide.id}
        className={`absolute w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-5' : 'opacity-0 z-0'}`}
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.9) contrast(1.1)',
          transform: 'translateZ(0)',
          willChange: index === currentSlide || Math.abs(index - currentSlide) <= 1 ? 'opacity' : 'auto'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10"></div>
      </div>
    ))}
    <div className="absolute inset-0 z-20 flex items-center justify-center text-white text-center p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="inline-block px-4 py-2 bg-emerald-500/90 backdrop-blur-sm rounded-full text-sm font-semibold tracking-wide">
            🌱 Fresh & Organic
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black drop-shadow-2xl mb-6 leading-tight">
          <span className="bg-gradient-to-r from-emerald-300 to-green-200 bg-clip-text text-transparent">
            {realSlides[currentSlide]?.title}
          </span>
        </h1>
        <p className="text-xl md:text-3xl mb-8 drop-shadow-lg font-light text-green-100 max-w-2xl mx-auto">
          {realSlides[currentSlide]?.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/category"
            className="group bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 text-lg font-bold tracking-wide flex items-center gap-3"
          >
            <SparklesIcon className={`w-6 h-6 ${isScrolling ? '' : 'animate-pulse'}`} />
            Khám Phá Ngay
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
    <button
      className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 shadow-xl transition-all border border-white/20"
      onClick={() => setCurrentSlide((currentSlide - 1 + realSlides.length) % realSlides.length)}
      aria-label="Slide trước"
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    <button
      className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 shadow-xl transition-all border border-white/20"
      onClick={() => setCurrentSlide((currentSlide + 1) % realSlides.length)}
      aria-label="Slide sau"
    >
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
      {realSlides.map((_, idx) => (
        <button
          key={idx}
          className={`transition-all duration-300 ${idx === currentSlide ? 'w-8 h-3 bg-emerald-400 rounded-full' : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/70'}`}
          onClick={() => setCurrentSlide(idx)}
          aria-label={`Chuyển đến slide ${idx + 1}`}
        />
      ))}
    </div>
  </div>
);

export default HeroSection;
