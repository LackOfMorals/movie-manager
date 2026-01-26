# Build a Movie Web Application with Neo4j and GraphQL

This tutorial guides you through building a complete web application using Neo4j's DataAPI GraphQL service. You'll learn how to read, create, update, and delete data in order to build a movie management application.

## But first 

All of the code and the tutorial documents for each chapter is in this repo. 

```
git clone https://github.com/LackOfMorals/movie-manager.git
cd movie-manager

```

In this Tutorial, Movie Manager grows iteratively across the Chapters with each chapter having its own copy of Movie Manager at that stage of development.  The tutorial content for each chapter discusses and highlights the use of GraphQL with React. 

If you follow the Chapters in sequence, you will be able to see the changes take place. 

Let's start by familiarising ourselves with GraphQL and Neo4j. 

## A quick introduction to GraphQL and Neo4j

GraphQL is an API query language and runtime for building APIs originally built by Facebook. GraphQL queries allow you to describe your data, ask for what you want, and then deliver predictable results - it's essentially a mechanism that describes an API and a way to query it. It is important to understand that GraphQL is fundamentally based on a graph data model that treats your data as a collection of nodes and edges ( edges being relationships ).  Does this mean that GraphQL requires a graph database ? No, GraphQL is agnostic as to how the underlying data is held.  It could be in a relational database like Oracle, a NoSQL one like Couchbase or even in a text file but it presents as a graph of connected data. 

Let's look at some key GraphQL concepts:-
- **Nodes and edges**: GraphQL models application data as a graph, where entities are nodes and the relationships between them are edges.
- **Schema-Driven**: A GraphQL schema defines these types (nodes) and their relationships (edges), allowing clients to navigate the graph.
- **Hierarchical Queries**: GraphQL queries are hierarchical, meaning they allow you to start at a specific node and traverse connected nodes, creating a "tree" representation from the broader graph. 

Neo4j fits well with GraphQL; it's a graph database that stores data ( nodes ) and connections between them ( relationships or edges with GraphQL ).  Neo4j provides GraphQL functionality for self-managed and as a SaaS offering within Neo4j Aura.  It is the latter that we will use with this guide. 

If you want to learn more about Neo4j and GraphQL , then it is recommended to enrol with the free [Neo4j GraphAcademy](https://graphacademy.neo4j.com/) and take these courses

- [Neo4j Fundamentals](https://graphacademy.neo4j.com/courses/neo4j-fundamentals/?category=beginners)
- [Introduction to Neo4j & GraphQL](https://graphacademy.neo4j.com/courses/graphql-basics/?category=development)


## What You'll Build

By the end of this tutorial, you'll have a fully functional web application that:
- Displays movies from the Neo4j Movie graph database
- Allows you to create new movies and people
- Enables editing existing movies
- Supports searching across movies, actors, and directors
- Manages relationships between movies and people
- Uses GraphQL for efficient data fetching

## What You'll Learn

- How to connect a web application to Neo4j using GraphQL
- Reading data from a graph database with GraphQL queries
- Creating and modifying data with GraphQL mutations
- Managing relationships in a graph database
- Implementing search functionality across connected data

## What You'll Not Learn
- How to copy and paste large amounts of code 

All of the code for a chapter is included in each chapters folder; you can dive in and explore if you wish. If you do have the time to read the tutorial in each chapter, you will see relevant code snippets that illustrate how to put what is being described into practice.   

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18 or later** installed on your computer
- **A Neo4j Aura account** with a Pro, paid or free trial,  database instance
- **Basic knowledge** of JavaScript/TypeScript, React and GraphQL
- **A code editor** like VS Codium
- **git** To clone this repo so you can run the code 

If you don't have a Neo4j Aura account, you can [sign up for a free Pro trial](https://neo4j.com/cloud/aura-free/).

## Tutorial Overview

This tutorial is divided into the following chapters:

1. **[Set Up Your Environment](./chapter1/TUTORIAL_CHAPTER1.md)** - Create your project and configure Neo4j
2. **[Read Data from Neo4j](./chapter2/TUTORIAL_CHAPTER2.md)** - Display movies from your database
3. **[Create New Data](./chapter3/TUTORIAL_CHAPTER3.md)** - Add new movies to your database
4. **[Update Existing Data](./chapter4/TUTORIAL_CHAPTER4.md)** - Edit movie information
5. **[Delete Data](./chapter5/TUTORIAL_CHAPTER5.md)** - Remove movies from your database
6. **[Manage Relationships](./chapter6/TUTORIAL_CHAPTER6.md)** - Connect actors and directors to movies
7. **[Search and Filter](./chapter7/TUTORIAL_CHAPTER7.md)** - Implement search functionality

Let's get started!

---
