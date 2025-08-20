"use server";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import { cookies } from "next/headers";
import { cache } from "react";
import { 
  createUser, 
  findUserByEmail, 
  findUserById,
  createSession as createSessionInDB, 
  findSessionById, 
  deleteSession,
  deleteExpiredSessions
} from "@/lib/database";

export async function generateSessionToken(): Promise<string> {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
}

export async function createSession(token: string, userId: number): Promise<any> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
	
	const session = await createSessionInDB(sessionId, userId, expiresAt);
	return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await findSessionById(sessionId);
	
	if (!result) {
		return { session: null, user: null };
	}
	
	const { userId, expiresAt, ...session } = result;
	
	if (Date.now() >= new Date(expiresAt).getTime()) {
		await deleteSession(sessionId);
		return { session: null, user: null };
	}
	
	// Extend session if it's close to expiring
	if (Date.now() >= new Date(expiresAt).getTime() - 1000 * 60 * 60 * 24 * 15) {
		const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await createSessionInDB(sessionId, userId, newExpiresAt);
		session.expiresAt = newExpiresAt;
	}

    const safeUser = {
        id: userId,
        email: result.email,
    }

	return { session, user: safeUser };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await deleteSession(sessionId);
}

export type SessionValidationResult =
	| { session: any; user: { id: number; email: string } }
	| { session: null; user: null };

/* Cookies */
export async function setSessionTokenCookie(token: string, expiresAt: Date): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		path: "/"
	});
}

export async function deleteSessionTokenCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", "", {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: 0,
		path: "/"
	});
}

export const getCurrentSession = cache(async (): Promise<SessionValidationResult> => {
	const cookieStore = await cookies();
	const token = cookieStore.get("session")?.value ?? null;
	if (token === null) {
		return { session: null, user: null };
	}
	const result = await validateSessionToken(token);
	return result;
});

/* User register, login, logout */
export const hashPassword = async (password: string) => {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(password)));
}

export const verifyPassword = async (password: string, hash: string) => {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

export const registerUser = async (email: string, password: string) => {
    const passwordHash = await hashPassword(password);
    try {
        const user = await createUser(email, passwordHash);

        const safeUser = {
            id: user.id,
            email: user.email,
        };

        return {
            user: safeUser,
            error: null,
        }
    } catch(e) {
        return {
            user: null,
            error: "Failed to register user"
        }
    }
}

export const loginUser = async (email: string, password: string) => {
    const user = await findUserByEmail(email);

    if(!user) {
        return {
            user: null,
            error: "User not found",
        }
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if(!passwordValid) {
        return {
            user: null,
            error: "Invalid password",
        }
    }

    const token = await generateSessionToken();
    const session = await createSession(token, user.id);
    await setSessionTokenCookie(token, session.expiresAt);

    const safeUser = {
        id: user.id,
        email: user.email,
    };

    return {
        user: safeUser,
        error: null,
    }
}

export const logoutUser = async () => {
    const session = await getCurrentSession();
    if(session.session?.id) {
        await invalidateSession(session.session.id);
    }
    await deleteSessionTokenCookie();
}