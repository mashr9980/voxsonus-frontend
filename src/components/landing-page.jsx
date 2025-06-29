"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileAuthMenu } from "./mobile-auth-menu";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, CheckCircle, Star, Play, ArrowRight, Volume2, Eye, Accessibility, FileText } from "lucide-react";
import { AuthButtons } from "./auth-button";

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-800"></div>
                <span className="text-xl font-bold text-gray-900">
                  Voxsonus
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <AuthButtons variant="header" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <MobileAuthMenu onClose={() => setIsMobileMenuOpen(false)} />
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="p-3 bg-purple-100 rounded-full">
                <Volume2 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Accessibility className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">
                Closed Captions
              </span>{" "}
              & Non-Verbal Sounds
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Transform your videos with comprehensive closed captions that include dialogue, 
              sound effects, music descriptions, and environmental audio cues. 
              Fully accessible and compliant with industry standards.
            </p>
            <AuthButtons variant="hero" />
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                ADA Compliant
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                WCAG 2.1 AA Standards
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                FCC Requirements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Provide Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Closed Captioning Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive closed captions that go beyond simple transcription
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Dialogue & Speech
              </h3>
              <p className="text-gray-600 text-sm">
                Accurate transcription of all spoken content with proper speaker identification and timing.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sound Effects
              </h3>
              <p className="text-gray-600 text-sm">
                Detailed descriptions of sound effects, ambient noise, and environmental audio cues.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Music & Audio
              </h3>
              <p className="text-gray-600 text-sm">
                Musical descriptions, mood indicators, and audio atmosphere details for complete context.
              </p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Accessibility className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Accessibility Features
              </h3>
              <p className="text-gray-600 text-sm">
                Full compliance with accessibility standards including speaker identification and audio descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Voxsonus?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional closed captioning services that meet the highest industry standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Precision & Accuracy
              </h3>
              <p className="text-gray-600">
                Industry-leading accuracy in caption timing, speaker identification, 
                and non-verbal audio descriptions. Every detail matters for true accessibility.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Multiple Languages
              </h3>
              <p className="text-gray-600">
                Support for 50+ languages with native-quality translations and 
                culturally appropriate non-verbal sound descriptions.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Fast Turnaround
              </h3>
              <p className="text-gray-600">
                Get your complete closed captions with sound descriptions ready in minutes, 
                not hours. Perfect for tight production deadlines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Applications Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From entertainment to education, our closed captions serve diverse content needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Broadcasting & Media</h3>
              <p className="text-gray-600 text-sm mb-3">
                FCC-compliant closed captions for television, streaming platforms, and digital media.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• TV shows and movies</li>
                <li>• Live broadcasts</li>
                <li>• Streaming content</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Education & Training</h3>
              <p className="text-gray-600 text-sm mb-3">
                ADA-compliant captions for educational content and corporate training materials.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Online courses</li>
                <li>• Training videos</li>
                <li>• Educational content</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Corporate & Marketing</h3>
              <p className="text-gray-600 text-sm mb-3">
                Professional captions for marketing videos, presentations, and corporate communications.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Marketing videos</li>
                <li>• Product demos</li>
                <li>• Corporate presentations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-24 bg-gradient-to-r from-purple-600 to-purple-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for Professional Closed Captions?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Join thousands of content creators who trust Voxsonus for comprehensive 
              closed captioning with complete audio descriptions and non-verbal sound details.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <div className="mt-8 flex flex-wrap justify-center items-center gap-8 text-sm text-purple-200">
              <span>✓ No setup fees</span>
              <span>✓ Cancel anytime</span>
              <span>✓ Full accessibility compliance</span>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-800"></div>
              <span className="text-xl font-bold">Voxsonus</span>
            </div>
            <p className="text-gray-400 mb-4">
              Professional closed captioning services with comprehensive audio descriptions
            </p>
            <p className="text-sm text-gray-500">
              © 2025 Voxsonus. All rights reserved. | ADA Compliant | WCAG 2.1 AA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}