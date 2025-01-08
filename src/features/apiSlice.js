import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://countriesnow.space/api/v0.1' }),
  endpoints: (builder) => ({
    // Fetch all countries and their population
    getCountries: builder.query({
      query: () => '/countries/population',
    }),

    // Fetch states for a given country
    getStatesByCountry: builder.query({
      query: ({ country }) => ({
        url: '/countries/states',
        method: 'POST',
        body: { country },
      }),
    }),

    // Fetch population for a specific country (POST method)
    getCountryPopulation: builder.query({
      query: ({ country }) => ({
        url: '/countries/population',
        method: 'POST',
        body: { country }, // POST request with the country in the body
      }),
    }),

    // Fetch cities for a specific country
    getCitiesByCountry: builder.query({
      query: ({ country }) => ({
        url: '/countries/cities', // Fetch cities for the country
        method: 'POST',
        body: { country },
      }),
    }),

    // Fetch population data for cities in a country
    getCitiesPopulationByCountry: builder.query({
      query: ({ cities}) => ({
        url: '/countries/population/cities', // Use the same endpoint for population data
        method: 'POST',
        body: { cities }, // Send cities as an array of city names
      }),
    }),
  }),
});

export default apiSlice;

export const {
  useGetCountriesQuery,
  useLazyGetCountryPopulationQuery,
  useLazyGetCitiesByCountryQuery, // Lazy query for cities by country
  useLazyGetCitiesPopulationByCountryQuery, // Lazy query for city populations
} = apiSlice;
