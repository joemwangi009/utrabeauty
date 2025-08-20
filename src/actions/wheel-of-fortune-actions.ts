"use server";

import { Product } from "@/sanity.types";
import { createClient } from "next-sanity";
import { getCurrentSession } from "./auth";
import { createWheelOfFortuneSpin, findUserSpinsToday } from "@/lib/database";

// Minimum purchase amount required to be eligible for wheel of fortune
const MINIMUM_PURCHASE_AMOUNT = 300; // $300 USD

export const getWheelOfFortuneConfiguration = async () => {
    const client = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
        useCdn: true,
    });

    const randomProducts = await client.fetch<Product[]>(
        `*[_type == "product"][0..6]`
    );

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    const winningIndex = (day * 31 + month * 12 + year) % randomProducts.length;

    return {
        randomProducts,
        winningIndex,
    }
}

export const checkWheelOfFortuneEligibility = async () => {
    const { user } = await getCurrentSession();
    
    if (!user) {
        return {
            isEligible: false,
            reason: "Please sign in to check your eligibility",
            totalSpent: 0,
            minimumRequired: MINIMUM_PURCHASE_AMOUNT,
            remainingAmount: MINIMUM_PURCHASE_AMOUNT
        };
    }

    try {
        // Get user's total purchase history from Sanity orders
        const client = createClient({
            projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
            dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
            apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
            token: process.env.SANITY_API_READ_TOKEN,
            useCdn: false,
        });

        // Query completed orders for this user
        const userOrders = await client.fetch(`*[_type == "order" && customerId == $userId && status == "COMPLETED"] {
            totalPrice
        }`, { userId: user.id.toString() });

        // Calculate total spent
        const totalSpent = userOrders.reduce((total: number, order: any) => total + (order.totalPrice || 0), 0);
        
        // Check if user has already spun the wheel for their current eligibility
        const userSpinsToday = await findUserSpinsToday(user.id);
        const hasSpunToday = userSpinsToday.length > 0;

        const isEligible = totalSpent >= MINIMUM_PURCHASE_AMOUNT && !hasSpunToday;
        const remainingAmount = Math.max(0, MINIMUM_PURCHASE_AMOUNT - totalSpent);

        return {
            isEligible,
            reason: isEligible 
                ? "You're eligible to spin the wheel!" 
                : hasSpunToday 
                    ? "You've already spun the wheel today. Come back tomorrow!" 
                    : `Spend $${remainingAmount.toFixed(2)} more to unlock the wheel of fortune`,
            totalSpent,
            minimumRequired: MINIMUM_PURCHASE_AMOUNT,
            remainingAmount,
            hasSpunToday: !!hasSpunToday
        };
    } catch (error) {
        console.error("Error checking wheel of fortune eligibility:", error);
        return {
            isEligible: false,
            reason: "Unable to check eligibility at this time",
            totalSpent: 0,
            minimumRequired: MINIMUM_PURCHASE_AMOUNT,
            remainingAmount: MINIMUM_PURCHASE_AMOUNT
        };
    }
}

export const recordWheelOfFortuneSpin = async () => {
    const { user } = await getCurrentSession();
    
    if (!user) {
        throw new Error("User not authenticated");
    }

    try {
        // Record the spin in the database
        await createWheelOfFortuneSpin(user.id, new Date());
        return { success: true };
    } catch (error) {
        console.error("Error recording wheel of fortune spin:", error);
        throw new Error("Failed to record spin");
    }
}