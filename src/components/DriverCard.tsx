interface DriverCardProps {
  driver: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
    vehicleModel: string;
    plateNumber: string;
    estimatedArrival?: number;
  };
  onAccept?: () => void;
  onReject?: () => void;
  status?: 'pending' | 'accepted' | 'rejected';
}

export default function DriverCard({
  driver,
  onAccept,
  onReject,
  status = 'pending'
}: DriverCardProps) {
  return (
    <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        {/* Driver Photo */}
        <div className="relative w-16 h-16">
          {driver.photo ? (
            <img
              src={driver.photo}
              alt={driver.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl text-primary-600">
                {driver.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-secondary-500 rounded-full border-2 border-white" />
        </div>

        {/* Driver Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{driver.name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-primary-500">★</span>
              <span className="text-sm text-gray-600">{driver.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>{driver.vehicleModel}</p>
            <p className="font-medium">{driver.plateNumber}</p>
          </div>

          {driver.estimatedArrival && (
            <p className="mt-2 text-sm text-primary-600">
              Arrives in {Math.round(driver.estimatedArrival)} mins
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {status === 'pending' && (
          <div className="flex gap-2">
            <button
              onClick={onReject}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={onAccept}
              className="p-2 text-secondary-500 hover:text-secondary-600 hover:bg-secondary-50 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        )}

        {status === 'accepted' && (
          <div className="px-3 py-1 bg-secondary-100 text-secondary-700 text-sm font-medium rounded-full">
            Accepted
          </div>
        )}

        {status === 'rejected' && (
          <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            Rejected
          </div>
        )}
      </div>
    </div>
  );
}