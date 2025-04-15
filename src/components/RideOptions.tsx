interface RideOptionsProps {
  onSelect: (type: 'standard' | 'premium' | 'xl') => void;
  fareDetails: {
    fare: number;
    distance: number;
    duration: number;
    currency: string;
  };
  selected?: 'standard' | 'premium' | 'xl';
}

export default function RideOptions({ onSelect, fareDetails, selected }: RideOptionsProps) {
  const vehicles: Array<{
    id: 'standard' | 'premium' | 'xl';
    name: string;
    description: string;
    image: string;
    multiplier: number;
  }> = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Economic',
      image: '/assets/standard.png',
      multiplier: 1
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Luxury vehicles',
      image: '/assets/premium.png',
      multiplier: 1.5
    },
    {
      id: 'xl',
      name: 'XL',
      description: 'SUVs & Vans',
      image: '/assets/xl.png',
      multiplier: 2
    }
  ];

  return (
    <div className="p-4 bg-white rounded-t-2xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Select Ride Type</h3>
      <div className="space-y-4">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              selected === vehicle.id ? 'bg-primary-50 border border-primary-500' : 'border hover:bg-gray-50'
            }`}
            onClick={() => onSelect(vehicle.id)}
          >
            <img src={vehicle.image} alt={vehicle.name} className="w-16 h-16 object-contain" />
            <div className="ml-4 flex-1">
              <h4 className="font-medium">{vehicle.name}</h4>
              <p className="text-sm text-gray-500">{vehicle.description}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {fareDetails.currency} {(fareDetails.fare * vehicle.multiplier).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {Math.round(fareDetails.duration / 60)} min
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}