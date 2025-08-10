'use client';

import { useState } from 'react';
import { Calendar, Users, CreditCard, Smartphone } from 'lucide-react';
import { Property, BookingRequest, PaymentRequest } from '@/types';

interface BookingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ property, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1); // 1: Booking details, 2: Payment
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'google_pay' | 'apple_pay' | 'paypal'>('credit_card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [totalPrice, setTotalPrice] = useState(0);

  if (!isOpen) return null;

  // Calculate total price
  const calculateTotal = () => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return property.price * nights;
    }
    return 0;
  };

  const handleBookingSubmit = async () => {
    if (!checkInDate || !checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (checkIn < today) {
      alert('Check-in date cannot be in the past');
      return;
    }

    if (checkOut <= checkIn) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    try {
      const userSession = localStorage.getItem('userSession') || Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userSession', userSession);

      const bookingData: BookingRequest = {
        property_id: property.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests,
        user_session: userSession
      };

      console.log('Submitting booking:', bookingData);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Booking response status:', response.status);
      
      if (response.ok) {
        const bookingResult = await response.json();
        console.log('Booking successful:', bookingResult);
        setBooking(bookingResult);
        setTotalPrice(bookingResult.total_price);
        setStep(2);
      } else {
        const errorText = await response.text();
        console.error('Booking error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          alert(error.error || 'Failed to create booking');
        } catch {
          alert(`Failed to create booking: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const paymentData: PaymentRequest = {
        booking_id: booking.id,
        payment_method: paymentMethod,
        ...(paymentMethod === 'credit_card' && { card_details: cardDetails })
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const paymentResult = await response.json();
        alert('Payment successful! Booking confirmed.');
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Book Your Stay' : 'Payment Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              {/* Property Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">{property.title}</h3>
                <p className="text-gray-600">{property.location}</p>
                <p className="text-lg font-bold text-primary-600">${property.price}/night</p>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={today}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || today}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Price Summary */}
                {checkInDate && checkOutDate && (
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>
                        ${property.price} × {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBookingSubmit}
                disabled={!checkInDate || !checkOutDate || loading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Booking...' : 'Continue to Payment'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <p className="text-sm text-gray-600">Property: {property.title}</p>
                <p className="text-sm text-gray-600">Dates: {checkInDate} to {checkOutDate}</p>
                <p className="text-sm text-gray-600">Guests: {guests}</p>
                <p className="text-lg font-bold text-primary-600 mt-2">Total: ${totalPrice}</p>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 mr-2" />
                    Credit Card
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="google_pay"
                      checked={paymentMethod === 'google_pay'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <Smartphone className="w-5 h-5 mr-2" />
                    Google Pay
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="apple_pay"
                      checked={paymentMethod === 'apple_pay'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <Smartphone className="w-5 h-5 mr-2" />
                    Apple Pay
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="mr-3"
                    />
                    <div className="w-5 h-5 mr-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center">P</div>
                    PayPal
                  </label>
                </div>
              </div>

              {/* Credit Card Details */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Pay $${totalPrice}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
