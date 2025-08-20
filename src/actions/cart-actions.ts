"use server";

import { getCurrentSession } from "@/actions/auth";
import { 
  createCart, 
  findCartById, 
  findCartByUserId,
  addCartItem,
  updateCartItemQuantity,
  clearCart,
  deleteCart
} from "@/lib/database";
import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import { revalidatePath } from "next/cache";

export const createCartAction = async () => {
    const { user } = await getCurrentSession();

    const cart = await createCart(crypto.randomUUID(), user?.id);
    return cart;
}

export const getOrCreateCart = async (cartId?: string | null) => {
    const { user } = await getCurrentSession();

    if(user) {
        const userCart = await findCartByUserId(user.id);
        if(userCart) {
            return userCart;
        }
    }

    if(!cartId) {
        return createCartAction();
    }

    const cart = await findCartById(cartId);
    if(!cart) {
        return createCartAction();
    }

    return cart;
}

export const updateCartItem = async (
    cartId: string,
    sanityProductId: string,
    data: {
        title?: string,
        price?: number,
        image?: string,
        quantity?: number,
    }
) => {
    const cart = await getOrCreateCart(cartId);

    if (!cart) {
        throw new Error('Cart not found');
    }

    const existingItem = cart.items?.find(
        (item: any) => sanityProductId === item.sanityProductId
    );

    if(existingItem) {
        // Update quantity
        if(data.quantity === 0) {
            await updateCartItemQuantity(existingItem.id, 0);
        } else if(data.quantity && data.quantity > 0) {
            await updateCartItemQuantity(existingItem.id, data.quantity);
        }
    } else if(data.quantity && data.quantity > 0) {
        await addCartItem(cartId, {
            sanityProductId,
            quantity: data.quantity,
            title: data.title || '',
            price: data.price || 0,
            image: data.image || '',
        });
    }

    revalidatePath("/");
    return getOrCreateCart(cartId);
}

export const syncCartWithUser = async (cartId: string | null) => {
    const { user } = await getCurrentSession();

    if(!user) {
        return null;
    }

    const existingUserCart = await findCartByUserId(user.id);
    const existingAnonymousCart = cartId ? await findCartById(cartId) : null;

    if(!cartId && existingUserCart) {
        return existingUserCart;
    }

    if(!cartId) {
        return createCartAction();
    }

    if(!existingAnonymousCart && !existingUserCart) {
        return createCartAction();
    }

    if(existingUserCart && existingUserCart.id === cartId) {
        return existingUserCart;
    }

    if(!existingUserCart) {
        // Update anonymous cart to link with user
        await createCart(cartId, user.id);
        return findCartById(cartId);
    }

    if(!existingAnonymousCart) {
        return existingUserCart;
    }

    // Merge anonymous cart items into user cart
    for(const item of existingAnonymousCart.items || []) {
        const existingItem = existingUserCart.items?.find((userItem: any) => userItem.sanityProductId === item.sanityProductId);

        if(existingItem) {
            // Add quantities together
            await updateCartItemQuantity(existingItem.id, existingItem.quantity + item.quantity);
        } else {
            // Add new item to user's cart
            await addCartItem(existingUserCart.id, {
                sanityProductId: item.sanityProductId,
                quantity: item.quantity,
                title: item.title,
                price: item.price,
                image: item.image
            });
        }
    }

    // Delete anonymous cart
    await deleteCart(cartId);
    revalidatePath("/");
    return getOrCreateCart(existingUserCart.id);
}

export const addWinningItemToCart = async (cartId: string, product: Product) => {
    const cart = await getOrCreateCart(cartId);

    if (!cart) {
        throw new Error('Cart not found');
    }

    const updatedCart = await updateCartItem(cart.id, product._id, {
        title: `🎁 ${product.title} (Won)`,
        price: 0,
        image: product.image ? urlFor(product.image).url() : '',
        quantity: 1,
    });

    return updatedCart;
}