import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import './infoPopup.css'; // Import the custom CSS file

const InfoPopup = ({ country, state, onClose }) => {
  const [currencyData, setCurrencyData] = useState(null);
  const [flagData, setFlagData] = useState(null);
  const [capitalData, setCapitalData] = useState('N/A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchCountryData = async () => {
      if (!country) return;

      setLoading(true);
      setError(null);

      try {
        const [currencyResponse, flagResponse, capitalResponse] = await Promise.all([
          fetch('https://countriesnow.space/api/v0.1/countries/currency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country }),
          }).then((res) => res.json()),
          fetch('https://countriesnow.space/api/v0.1/countries/flag/images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country }),
          }).then((res) => res.json()),
          fetch('https://countriesnow.space/api/v0.1/countries/capital', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country }),
          }).then((res) => res.json()),
        ]);

        setCurrencyData(currencyResponse?.data?.currency || 'N/A');
        setFlagData(flagResponse?.data?.flag || '');
        setCapitalData(capitalResponse?.data?.capital || 'N/A');
      } catch (err) {
        setError('Failed to fetch country details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryData();
  }, [country]);

  if (!country) return null;

  return (
    <Modal show onHide={onClose} centered>
  <Modal.Header closeButton>
    <Modal.Title>Details for {state}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {loading ? (
      <div className="info-popup-loading">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : error ? (
      <div className="info-popup-error">{error}</div>
    ) : (
      <div className="info-popup-content">
        <div className="info-popup-item currency-flag">
          <strong>Currency:</strong>{currencyData}
          {flagData && (
            <div className="flag-container">
              <br/>
              <strong>Flag: </strong>
              <img 
                src={flagData} 
                alt={"flag"} 
                className="info-popup-flag" 
              />
              <br/>
              <strong>Country: </strong>{country}
            </div>
          )}
        </div>
        <div className="info-popup-item location-capital">
          <br />
          <strong>State: </strong>{state}
          <br />
          <strong>Capital: </strong> {capitalData}
        </div>
      </div>
    )}
  </Modal.Body>
</Modal>

  );
};

export default InfoPopup;