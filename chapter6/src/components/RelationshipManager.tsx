import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { 
  ASSIGN_ACTOR, 
  REMOVE_ACTOR, 
  ASSIGN_DIRECTOR, 
  REMOVE_DIRECTOR,
  GET_PEOPLE 
} from '../graphql/operations';
import type { Movie } from '../types/movie';

interface Props {
  movie: Movie;
  onComplete: () => void;
}

interface GetPeopleResponse {
  people: { name: string; born?: number }[];
}

export function RelationshipManager({ movie, onComplete }: Props) {
  const queryClient = useQueryClient();
  const [selectedPerson, setSelectedPerson] = useState('');
  const [relationType, setRelationType] = useState<'actor' | 'director'>('actor');
  const { data: peopleData, isLoading: peopleLoading } = useQuery({
    queryKey: ['people'],
    queryFn: async () =>
      graphqlClient.request<GetPeopleResponse>(GET_PEOPLE, { limit: 200 })
  });

  const assignActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(ASSIGN_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setSelectedPerson('');
      onComplete();
    }
  });

  const removeActorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
      graphqlClient.request(REMOVE_ACTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const assignDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(ASSIGN_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      setSelectedPerson('');
      onComplete();
    }
  });

  const removeDirectorMutation = useMutation({
    mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
      graphqlClient.request(REMOVE_DIRECTOR, variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      onComplete();
    }
  });

  const handleAssign = () => {
    if (!selectedPerson) {
      alert('Please select a person');
      return;
    }

    // Check if already assigned
    if (relationType === 'actor' && movie.peopleActedIn?.some(a => a.name === selectedPerson)) {
      alert('This person is already an actor in this movie');
      return;
    }
    if (relationType === 'director' && movie.peopleDirected?.some(d => d.name === selectedPerson)) {
      alert('This person is already a director of this movie');
      return;
    }

    if (relationType === 'actor') {
      assignActorMutation.mutate({
        movieTitle: movie.title,
        actorName: selectedPerson
      });
    } else {
      assignDirectorMutation.mutate({
        movieTitle: movie.title,
        directorName: selectedPerson
      });
    }
  };

  const handleRemove = (personName: string, type: 'actor' | 'director') => {
    const confirmed = window.confirm(
      `Remove ${personName} as ${type === 'actor' ? 'an actor' : 'a director'} from ${movie.title}?`
    );

    if (!confirmed) return;

    if (type === 'actor') {
      removeActorMutation.mutate({
        movieTitle: movie.title,
        actorName: personName
      });
    } else {
      removeDirectorMutation.mutate({
        movieTitle: movie.title,
        directorName: personName
      });
    }
  };

  // Get available people (not already assigned in current role)
  const availablePeople = peopleData?.people.filter(person => {
    if (relationType === 'actor') {
      return !movie.peopleActedIn?.some(a => a.name === person.name);
    } else {
      return !movie.peopleDirected?.some(d => d.name === person.name);
    }
  }) || [];

  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6"> Manage Cast & Crew - {movie.title} </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Actors ({movie.peopleActedIn?.length || 0})</h4>
          {movie.peopleActedIn && movie.peopleActedIn.length > 0 ? (
            <ul className="space-y-2">
              {movie.peopleActedIn.map(actor => (
                <li key={actor.name} className="flex justify-between items-center bg-white border border-gray-200 rounded-md p-3">
                  <div className="text-gray-800">
                    <span>{actor.name}</span>
                    {actor.born && (
                      <span>Born {actor.born}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(actor.name, 'actor')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    disabled={removeActorMutation.isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm">No actors assigned</p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Directors ({movie.peopleDirected?.length || 0})</h4>
          {movie.peopleDirected && movie.peopleDirected.length > 0 ? (
            <ul className="space-y-2">
              {movie.peopleDirected.map(director => (
                <li key={director.name}>
                  <div className="text-gray-800">
                    <span>{director.name}</span>
                    {director.born && (
                      <span>Born {director.born}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleRemove(director.name, 'director')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    disabled={removeDirectorMutation.isPending}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm">No directors assigned</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add Person</h4>
          <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={relationType} 
            onChange={e => {
              setRelationType(e.target.value as 'actor' | 'director');
              setSelectedPerson('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="actor">Actor</option>
            <option value="director">Director</option>
          </select>


          <select 
            value={selectedPerson} 
            onChange={e => setSelectedPerson(e.target.value)}
            disabled={peopleLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              {peopleLoading ? 'Loading people...' : 'Select person...'}
            </option>
            {availablePeople.map((person) => (
              <option key={person.name} value={person.name}>
                {person.name} {person.born ? `(${person.born})` : ''}
              </option>
            ))}
          </select>

          <button 
            onClick={handleAssign} 
            disabled={
              !selectedPerson || 
              assignActorMutation.isPending || 
              assignDirectorMutation.isPending
            }
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Add {relationType}
          </button>
        </div>
      </div>

      <div className="manager-actions">
        <button onClick={onComplete} 
        className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
