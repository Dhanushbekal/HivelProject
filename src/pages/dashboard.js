import React, { useEffect, useState } from 'react';
import {
  useGetCountriesQuery,
  useLazyGetCountryPopulationQuery,
} from '../features/apiSlice';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import Spinner from 'react-bootstrap/Spinner';
import './dashboard.css';
import InfoPopup from '../components/infopopup';

const Dashboard = () => {
  const { data: countriesData, isLoading: isLoadingCountries, error } = useGetCountriesQuery();
  const [triggerGetCountryPopulation] = useLazyGetCountryPopulationQuery();

  const [populationData, setPopulationData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [range, setRange] = useState({ min: 0, max: 19 });
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [availableYears, setAvailableYears] = useState([]); // All available years
  const [selectedYear, setSelectedYear] = useState(2018);   // Default selected year

  // Fetch population data on initial load
  useEffect(() => {
    if (countriesData?.data) {
      const fetchPopulations = async () => {
        try {
          const filteredCountries = countriesData.data.slice(46); // Skip first 46 countries

          const populationPromises = filteredCountries.map((countryItem) =>
            triggerGetCountryPopulation({ country: countryItem.country }).unwrap()
          );

          const results = await Promise.all(populationPromises);

          const data = results.flatMap((result, index) => {
            return result.data.populationCounts.map((pop) => ({
              country: filteredCountries[index].country,
              year: pop.year,
              population: pop.value,
            }));
          });

          const uniqueYears = [...new Set(data.map((item) => item.year))].sort((a, b) => b - a);
          setAvailableYears(uniqueYears);
          setPopulationData(data);
          filterDataByYear(data, selectedYear);
        } catch (err) {
          console.error('Error fetching population data:', err);
        }
      };

      fetchPopulations();
    }
  }, [countriesData, triggerGetCountryPopulation, selectedYear]);

  // Filter data by year
  const filterDataByYear = (data, year) => {
    const filtered = data.filter((item) => item.year === year);
    setFilteredData(filtered);
    setRange({ min: 0, max: Math.min(filtered.length - 1, 19) });
  };
  

  // Handle year change
  const handleYearChange = (event) => {
    const year = parseInt(event.target.value, 10);
    setSelectedYear(year);
    filterDataByYear(populationData, year);
  };

  // Search handler
  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = populationData.filter(
      (data) => data.year === selectedYear && data.country.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredData(filtered);
    setRange({ min: 0, max: Math.min(filtered.length - 1, 19) });
    setSuggestions([]);
  };

  // Input change handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length >= 2) {
      const matchedSuggestions = populationData
        .filter((data) => data.year === selectedYear)
        .map((data) => data.country)
        .filter((country) => country.toLowerCase().includes(value.toLowerCase()));
      setSuggestions([...new Set(matchedSuggestions)]);
    } else {
      setSuggestions([]);
    }

    if (value === '') {
      filterDataByYear(populationData, selectedYear);
    }
  };

  // Pagination handlers
  const handleNext = () => {
    const total = filteredData.length;
    if (range.max < total - 1) {
      setRange((prev) => ({
        min: Math.min(prev.min + 20, total - 20),
        max: Math.min(prev.max + 20, total - 1),
      }));
    }
  };

  const handlePrev = () => {
    if (range.min > 0) {
      setRange((prev) => ({
        min: Math.max(prev.min - 20, 0),
        max: Math.max(prev.max - 20, 19),
      }));
    }
  };

  // Chart configuration
  const chartOptions = {
    chart: {
      type: 'column',
      width: 1200,
    },
    title: {
      text: `Population of Countries (${selectedYear})`,
    },
    xAxis: {
      categories: filteredData.map((data) => data.country),
      title: { text: 'Country' },
      labels: {
        rotation: -45,
        style: { fontSize: '10px', whiteSpace: 'nowrap' },
      },
      min: range.min,
      max: range.max,
    },
    yAxis: {
      title: { text: 'Population' },
    },
    tooltip: {
      shared: true,
      crosshairs: true,
    },
    series: [
      {
        name: 'Population',
        data: filteredData.map((data) => data.population),
        color: '#7cb5ec',
      },
    ],
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        pointWidth: 15,
        point: {
          events: {
            click: function () {
              setSelectedCountry(this.category);
            },
          },
        },
      },
    },
  };

  if (isLoadingCountries) return <Spinner animation="border" variant="primary" />;
  if (error) return <div>Error loading data: {error.message}</div>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Population by Country</h2>

      <div className="filters">
        <div className="year-filter">
          <label htmlFor="year-select">Year: </label>
          <select id="year-select" value={selectedYear} onChange={handleYearChange}>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a country..."
          value={searchTerm}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item" onClick={() => handleSearch(suggestion)} >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <button className="search-button" onClick={() => handleSearch(searchTerm)}>
          Search
        </button>
      </div>

      <div className="chart-wrapper">
        {filteredData.length > 0 ? (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        ) : (
          <div>No population data available for {selectedYear}.</div>
        )}
        <div className="pagination-buttons">
          <button className="prev-button" onClick={handlePrev} disabled={range.min === 0}>
            &larr;
          </button>
          <button className="next-button" onClick={handleNext} disabled={range.max >= filteredData.length - 1}>
            &rarr;
          </button>
        </div>
      </div>

      {selectedCountry && <InfoPopup country={selectedCountry} onClose={() => setSelectedCountry(null)} />}
    </div>
  );
};

export default Dashboard;
