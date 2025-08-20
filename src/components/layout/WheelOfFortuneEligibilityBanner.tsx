'use client';

import { checkWheelOfFortuneEligibility } from '@/actions/wheel-of-fortune-actions';
import { Lock, DollarSign, Gift, ShoppingBag } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type EligibilityStatus = {
    isEligible: boolean;
    reason: string;
    totalSpent: number;
    minimumRequired: number;
    remainingAmount: number;
    hasSpunToday?: boolean;
};

const WheelOfFortuneEligibilityBanner = () => {
    const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkEligibility();
    }, []);

    const checkEligibility = async () => {
        try {
            const result = await checkWheelOfFortuneEligibility();
            setEligibility(result);
        } catch (error) {
            console.error("Error checking eligibility:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !eligibility) {
        return null;
    }

    // Don't show banner if user is eligible
    if (eligibility.isEligible) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                            <Gift className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900">
                                Unlock the Wheel of Fortune! 🎁
                            </h3>
                            <p className="text-xs text-blue-700">
                                {eligibility.reason}
                            </p>
                        </div>
                    </div>

                    {eligibility.hasSpunToday !== true && (
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-xs text-blue-700">
                                <span>Progress:</span>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="font-medium">
                                        ${eligibility.totalSpent.toFixed(2)}
                                    </span>
                                    <span>/</span>
                                    <span className="font-medium">
                                        ${eligibility.minimumRequired.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="w-24 bg-blue-200 rounded-full h-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${Math.min(100, (eligibility.totalSpent / eligibility.minimumRequired) * 100)}%` 
                                        }}
                                    ></div>
                                </div>
                                <span className="text-xs text-blue-600 font-medium">
                                    {Math.round((eligibility.totalSpent / eligibility.minimumRequired) * 100)}%
                                </span>
                            </div>

                            <button 
                                onClick={() => window.location.href = '/#products'}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                            >
                                <ShoppingBag className="w-3 h-3" />
                                Shop Now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WheelOfFortuneEligibilityBanner; 