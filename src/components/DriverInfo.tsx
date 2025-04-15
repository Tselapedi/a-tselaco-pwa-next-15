interface DriverInfoProps {
  details: {
    name: string;
    vehicleModel: string;
    plateNumber: string;
    rating: number;
    photo?: string;
  };
}

export default function DriverInfo({ details }: DriverInfoProps) {
  const { name, vehicleModel, plateNumber, rating, photo } = details;

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl text-primary-600">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary-500 rounded-full border-2 border-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-primary-500">★</span>
              <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>{vehicleModel}</p>
            <p className="font-medium">{plateNumber}</p>
          </div>
        </div>

        <button 
          className="px-4 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
          onClick={() => {/* TODO: Implement call functionality */}}
        >
          Call Driver
        </button>
      </div>
    </div>
  );
}