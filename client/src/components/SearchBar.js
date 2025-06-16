import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import CitySelect from './CitySelect';

const SearchBar = ({ onSearch, initialValues = {} }) => {
  const [filters, setFilters] = React.useState({
    destination: initialValues.destination || '',
    startDate: initialValues.startDate || '',
    endDate: initialValues.endDate || '',
    minBudget: initialValues.minBudget || '',
    maxBudget: initialValues.maxBudget || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      destination: '',
      startDate: '',
      endDate: '',
      minBudget: '',
      maxBudget: '',
    });
    onSearch({});
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded shadow-sm">
      <Row className="g-3">
        <Col md={4}>
          <CitySelect
            value={filters.destination}
            onChange={(e) => handleChange({ target: { name: 'destination', value: e.target.value } })}
            label="Destination"
          />
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Min Budget</Form.Label>
            <Form.Control
              type="number"
              name="minBudget"
              value={filters.minBudget}
              onChange={handleChange}
              placeholder="Min PKR"
            />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Max Budget</Form.Label>
            <Form.Control
              type="number"
              name="maxBudget"
              value={filters.maxBudget}
              onChange={handleChange}
              placeholder="Max PKR"
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" type="submit">
            <FaSearch className="me-2" />
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default SearchBar; 