export const generateEventId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (time: string) => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
};