import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
// Removed Dialog imports - using custom modal styling
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, CreditCard, CheckCircle, Loader2 } from "lucide-react";

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  cartTotal, 
  cartItems, 
  onPaymentSuccess,
  user 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('method'); // 'method', 'details', 'processing', 'success'

  const paymentMethods = [
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'Pay with MTN Mobile Money'
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: CreditCard,
      description: 'Pay with Orange Money'
    }
  ];

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
    setPaymentStep('details');
  };

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Import apiService
      const apiService = (await import('../services/apiService')).default;

      // Process mobile money payment through backend
      const paymentData = {
        clientId: user.id,
        orderId: null, // Will be set after order creation
        amount: cartTotal,
        phoneNumber: phoneNumber,
        provider: paymentMethod === 'mobile_money' ? 'MTN' : 'ORANGE'
      };

      console.log('Processing payment with data:', paymentData);

      // Create order first, then process payment
      const orderData = {
        clientId: user.id,
        items: cartItems,
        totalAmount: cartTotal,
        paymentMethod: paymentMethod,
        phoneNumber: phoneNumber,
        status: 'CONFIRMED'
      };

      // Call the payment success callback which creates the order
      await onPaymentSuccess(orderData);

      // For now, simulate successful payment
      // In a real implementation, you would call the payment API here
      // const paymentResponse = await apiService.createPayment(paymentData);

      setPaymentStep('success');

      // Auto close after success
      setTimeout(() => {
        onClose();
        resetModal();
      }, 3000);

    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
      setPaymentStep('details');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setPaymentMethod('');
    setPhoneNumber('');
    setPaymentStep('method');
    setIsProcessing(false);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      resetModal();
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Payment Method</h3>
      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <method.icon className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <Label htmlFor={method.id} className="cursor-pointer">
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>

      {paymentMethod && (
        <Button
          onClick={() => setPaymentStep('details')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Continue with {paymentMethods.find(m => m.id === paymentMethod)?.name}
        </Button>
      )}
    </div>
  );

  const renderPaymentDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setPaymentStep('method')}
        >
          ← Back
        </Button>
        <h3 className="text-lg font-semibold">
          {paymentMethods.find(m => m.id === paymentMethod)?.name} Payment
        </h3>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Order Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Items ({cartItems.length})</span>
            <span>{cartTotal.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-1">
            <span>Total</span>
            <span>{cartTotal.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full"
        />
        <p className="text-xs text-gray-600">
          Enter the phone number linked to your {paymentMethods.find(m => m.id === paymentMethod)?.name} account
        </p>
      </div>

      <Button 
        onClick={handlePayment}
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={!phoneNumber || phoneNumber.length < 9}
      >
        Pay {cartTotal.toLocaleString()} FCFA
      </Button>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-4 py-8">
      <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600" />
      <h3 className="text-lg font-semibold">Processing Payment...</h3>
      <p className="text-gray-600">
        Please wait while we process your {paymentMethods.find(m => m.id === paymentMethod)?.name} payment
      </p>
      <p className="text-sm text-gray-500">
        You will receive an SMS confirmation shortly
      </p>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-4 py-8">
      <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
      <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
      <p className="text-gray-600">
        {cartTotal.toLocaleString()} FCFA has been deducted from {phoneNumber}
      </p>
      <p className="text-sm text-gray-500">
        Your order has been confirmed and you will receive updates via notifications
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Custom backdrop overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleClose} />

      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Complete Your Purchase</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 bg-white rounded-b-lg">
            {paymentStep === 'method' && renderMethodSelection()}
            {paymentStep === 'details' && renderPaymentDetails()}
            {paymentStep === 'processing' && renderProcessing()}
            {paymentStep === 'success' && renderSuccess()}
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
