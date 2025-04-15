interface TripDetails {
  status: 'accepted' | 'arrived' | 'started' | 'completed';
  eta?: number;
  distance?: number;
}

interface TripProgressProps {
  details: TripDetails;
}

export default function TripProgress({ details }: TripProgressProps) {
  const steps = [
    {
      id: 'pickup',
      title: 'Heading to pickup',
      address: '',
      icon: '📍'
    },
    {
      id: 'enroute',
      title: 'On the way',
      address: '',
      icon: '🚗'
    },
    {
      id: 'arrived',
      title: 'Arrived',
      address: '',
      icon: '✨'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === details.status);

  return (
    <div className="p-4 space-y-4">
      {details.eta && (
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-primary-600">
            {Math.round(details.eta)} mins
          </div>
          <div className="text-sm text-gray-600">Estimated time</div>
        </div>
      )}

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <div
              key={step.id}
              className={`relative flex items-start gap-4 ${
                index < steps.length - 1 ? 'pb-4' : ''
              }`}
            >
              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-6 top-8 bottom-0 w-0.5 ${
                    isCompleted ? 'bg-secondary-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Step Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                  ${isActive
                    ? 'bg-primary-500 text-white'
                    : isCompleted
                    ? 'bg-secondary-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {step.icon}
              </div>

              {/* Step Content */}
              <div className="flex-1">
                <h4 className={`font-medium ${
                  isActive ? 'text-primary-700' : 
                  isCompleted ? 'text-secondary-700' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  isActive ? 'text-primary-600' :
                  isCompleted ? 'text-secondary-600' :
                  'text-gray-500'
                }`}>
                  {step.address}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}