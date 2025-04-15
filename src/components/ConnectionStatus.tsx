interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  attempts?: number;
  onRetry?: () => void;
}

export default function ConnectionStatus({ status, attempts, onRetry }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      text: 'Connected',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-700',
      dotColor: 'bg-secondary-500'
    },
    connecting: {
      text: 'Connecting...',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-700',
      dotColor: 'bg-primary-500 animate-pulse'
    },
    disconnected: {
      text: 'Disconnected',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      dotColor: 'bg-gray-500'
    },
    reconnecting: {
      text: 'Reconnecting...',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning-700',
      dotColor: 'bg-warning-500 animate-pulse'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`px-3 py-1.5 ${config.bgColor} rounded-full inline-flex items-center gap-2`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}