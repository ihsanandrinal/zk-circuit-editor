'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, BookOpenIcon, TagIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { circuitExamples, getCategories, getDifficulties } from '../data/examples.js';

const ExampleSelector = ({ onExampleSelect, currentExample = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter examples based on selected filters and search term
  const filteredExamples = circuitExamples.filter(example => {
    const matchesCategory = selectedCategory === 'All' || example.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || example.difficulty === selectedDifficulty;
    const matchesSearch = searchTerm === '' || 
      example.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      example.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const handleExampleSelect = (example) => {
    onExampleSelect(example);
    setIsOpen(false);
  };

  const handleCustomSelect = () => {
    onExampleSelect(null); // null indicates custom mode
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSearchTerm('');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Basic': return <BookOpenIcon className="w-4 h-4" />;
      case 'Privacy': return <TagIcon className="w-4 h-4" />;
      case 'Cryptography': return <AcademicCapIcon className="w-4 h-4" />;
      case 'Data Structures': return <TagIcon className="w-4 h-4" />;
      case 'Identity': return <TagIcon className="w-4 h-4" />;
      case 'Mathematics': return <AcademicCapIcon className="w-4 h-4" />;
      case 'Security': return <TagIcon className="w-4 h-4" />;
      default: return <BookOpenIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <BookOpenIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {currentExample ? currentExample.title : 'Select Circuit Example'}
          </span>
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            {/* Search */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search examples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Filter Row */}
            <div className="flex space-x-2 text-xs">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="All">All Levels</option>
                {getDifficulties().map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
              
              {/* Clear Filters */}
              {(selectedCategory !== 'All' || selectedDifficulty !== 'All' || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-2 py-1 text-indigo-600 hover:text-indigo-800 underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Examples List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Custom Option */}
            <button
              onClick={handleCustomSelect}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                !currentExample ? 'bg-indigo-50 border-indigo-200' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">✏️</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Custom Circuit</div>
                  <div className="text-sm text-gray-500">Write your own circuit from scratch</div>
                </div>
              </div>
            </button>

            {/* Example Options */}
            {filteredExamples.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                <div className="text-sm">No examples match your filters</div>
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-800 underline text-xs mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredExamples.map((example, index) => (
                <button
                  key={example.id}
                  onClick={() => handleExampleSelect(example)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    index < filteredExamples.length - 1 ? 'border-b border-gray-100' : ''
                  } ${currentExample?.id === example.id ? 'bg-indigo-50 border-indigo-200' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Category Icon */}
                    <div className="mt-1 text-gray-400">
                      {getCategoryIcon(example.category)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Title and badges */}
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-900 truncate">
                          {example.title}
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(example.difficulty)}`}>
                            {example.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {example.description}
                      </div>
                      
                      {/* Category tag */}
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          {example.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
            {filteredExamples.length} of {circuitExamples.length} examples shown
          </div>
        </div>
      )}
    </div>
  );
};

export default ExampleSelector;