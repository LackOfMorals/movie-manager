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


