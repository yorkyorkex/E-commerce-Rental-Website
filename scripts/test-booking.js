// Test booking API
const testBooking = async () => {
  try {
    const bookingData = {
      property_id: 5, // Student Housing near Campus
      check_in_date: '2025-08-20',
      check_out_date: '2025-08-30',
      guests: 1,
      user_session: 'test_user_123'
    };

    console.log('Testing booking API with:', bookingData);
    
    const response = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testBooking();
