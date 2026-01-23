// Chapter 2
export interface Person {
  name: string;
  born?: number;
}


export interface Movie {
  title: string;
  released?: number;
  tagline?: string;
  peopleActedIn?: Person[];
  peopleDirected?: Person[];
}

// Chapter 3
export interface MovieFormData {
  title: string;
  released?: number;
  tagline?: string;
}

export interface PersonFormData {
  name: string;
  born?: number;
}

export interface CreateMovieResponse {
  createMovies: {
    movies: Array<{
      title: string;
      released?: number;
      tagline?: string;
    }>;
  };
}