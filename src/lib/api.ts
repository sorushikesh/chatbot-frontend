export const askBot = async (message: string): Promise<string> => {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bot response');
    }

    const data = await response.json();
    return data.response || 'Sorry, I didn’t understand that.';
  } catch (error) {
    console.error(error);
    return 'Sorry, there was an error while processing your request.';
  }
};
