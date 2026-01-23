import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { CREATE_MOVIE } from '../graphql/operations';
import type { MovieFormData, CreateMovieResponse } from '../types/movie';


interface MovieFormProps {
  onComplete: () => void;
}

export function MovieForm({ onComplete }: MovieFormProps) {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    released: undefined,
    tagline: ''
  });


  const createMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<CreateMovieResponse>(CREATE_MOVIE, data),
    onSuccess: () => {
      // Invalidate the movies query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    },
    onError: (error) => {
      alert(`Failed to create movie: ${error.message}`);
    }
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a movie title');
      return;
    }
    
    createMovieMutation.mutate(formData);
  };


  const handleChange = (
    field: keyof MovieFormData,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };


  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Movie</h2>
        <div className="block text-sm font-medium text-gray-700 mb-2">
          <label htmlFor="title" >
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            placeholder="Enter movie title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <div lassName="block text-sm font-medium text-gray-700 mb-2">
          <label htmlFor="released">Release Year</label>
          <input
            id="released"
            type="number"
            value={formData.released || ''}
            onChange={e => handleChange('released', parseInt(e.target.value))}
            placeholder="e.g., 2010"
            min="1900"
            max={new Date().getFullYear() + 5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <div lassName="block text-sm font-medium text-gray-700 mb-2">
          <label htmlFor="tagline">Tagline</label>
          <input
            id="tagline"
            type="text"
            value={formData.tagline || ''}
            onChange={e => handleChange('tagline', e.target.value)}
            placeholder="Enter a catchy tagline"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={createMovieMutation.isPending}
  
            className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 transition active:scale-110 "
          >
            {createMovieMutation.isPending ? 'Creating...' : 'Create Movie'}
          </button>
          <button 
            type="button" 
            onClick={onComplete}
            className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 transition active:scale-110 "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
