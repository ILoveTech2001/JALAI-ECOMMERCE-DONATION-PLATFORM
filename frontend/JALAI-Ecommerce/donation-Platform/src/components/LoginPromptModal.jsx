import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, UserPlus, LogIn } from "lucide-react";

const LoginPromptModal = ({ 
  isOpen, 
  onClose, 
  onSignup, 
  onLogin,
  cartTotal,
  cartItemsCount 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Account Required for Checkout
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Your Cart Summary</h4>
            <div className="text-sm text-blue-800">
              <div className="flex justify-between">
                <span>{cartItemsCount} item(s)</span>
                <span className="font-semibold">{cartTotal.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Create an account to continue</h3>
            <p className="text-gray-600 text-sm">
              You need an account to complete your purchase and track your orders
            </p>
          </div>

          <div className="space-y-3">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Button 
                  onClick={onSignup}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create New Account
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  New to JALAI? Sign up to get started
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-4">
                <Button 
                  onClick={onLogin}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login to Existing Account
                </Button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Already have an account? Sign in
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-500"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginPromptModal;
