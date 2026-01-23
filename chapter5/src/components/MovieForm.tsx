import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { CREATE_MOVIE, UPDATE_MOVIE } from '../graphql/operations';
import type { Movie, MovieFormData, CreateMovieResponse, UpdateMovieResponse } from '../types/movie';


interface MovieFormProps {
  movie?: Movie;  // Optional - if provided, we're editing
  onComplete: () => void;
}

export function MovieForm({ movie, onComplete }: MovieFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!movie;
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    released: undefined,
    tagline: ''
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        released: movie.released,
        tagline: movie.tagline
      });
    }
  }, [movie]);

  const createMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<CreateMovieResponse>(CREATE_MOVIE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    },
    onError: (error) => {
      alert(`Failed to create movie: ${error.message}`);
    }
  });

  const updateMovieMutation = useMutation({
    mutationFn: async (data: MovieFormData) =>
      graphqlClient.request<UpdateMovieResponse>(UPDATE_MOVIE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    },
    onError: (error) => {
      alert(`Failed to update movie: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a movie title');
      return;
    }
    
    if (isEditing) {
      updateMovieMutation.mutate(formData);
    } else {
      createMovieMutation.mutate(formData);
    }
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

  const isPending = createMovieMutation.isPending || updateMovieMutation.isPending;
  
  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{isEditing ? 'Edit Movie' : 'Add New Movie'}</h2>
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
            disabled={isEditing} // can't change when editing
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
             {isEditing && (
          <p className="help-text">
            Title cannot be changed (it's used as the identifier)
          </p>
        )}
        </div>
        <div className="block text-sm font-medium text-gray-700 mb-2">
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
        <div className="block text-sm font-medium text-gray-700 mb-2">
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
            {isPending 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Movie' : 'Create Movie')
            }
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

