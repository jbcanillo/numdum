import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationPicker from '../components/features/LocationPicker';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom }) => (
    <div data-testid="map-container" data-center={JSON.stringify(center)} data-zoom={zoom}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position }) => <div data-testid="marker" data-position={JSON.stringify(position)} />,
  useMap: jest.fn(() => ({
    flyTo: jest.fn()
  }))
}));

// Mock Leaflet
jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({}))
}));

describe('LocationPicker', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useMap as any).mockReturnValue({ flyTo: jest.fn() });
  });

  it('should render map and GPS button', () => {
    render(<LocationPicker onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    expect(screen.getByText('Use current location')).toBeInTheDocument();
  });

  it('should trigger geolocation when GPS button clicked', () => {
    const geolocationMock = {
      getCurrentPosition: jest.fn((success) => success({
        coords: { latitude: 1.234, longitude: 5.678 }
      }))
    };
    (navigator as any).geolocation = geolocationMock;

    render(<LocationPicker onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Use current location'));

    expect(geolocationMock.getCurrentPosition).toHaveBeenCalled();
  });

  it('should show marker on map click', () => {
    render(<LocationPicker onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

    const mapContainer = screen.getByTestId('map-container');
    fireEvent.click(mapContainer, { latlng: { lat: 10, lng: 20 } });

    // The mock Marker receives position prop
    expect(screen.getByTestId('marker')).toHaveAttribute('data-position', JSON.stringify({ lat: 10, lng: 20 }));
  });

  it('should flyTo coordinates after GPS success', async () => {
    const geolocationMock = {
      getCurrentPosition: jest.fn((success) => success({
        coords: { latitude: 1.234, longitude: 5.678 }
      }))
    };
    (navigator as any).geolocation = geolocationMock;
    const flyToMock = jest.fn();
    (useMap as any).mockReturnValue({ flyTo: flyToMock });

    render(<LocationPicker onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText('Use current location'));

    await waitFor(() => {
      expect(flyToMock).toHaveBeenCalledWith({ lat: 1.234, lng: 5.678 }, 15, { duration: 1 });
    });
  });
});
