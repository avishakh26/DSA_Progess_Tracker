package com.dsajourney.desktop.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * The web app hashes with bcryptjs, which emits standard $2a$/$2b$ hashes, so
 * jBCrypt validates them directly. jBCrypt only understands the $2a$ prefix,
 * so $2b$/$2y$ hashes are normalised before checking — the algorithm behind
 * those prefixes is identical, they differ only in how a long-password bug was
 * flagged.
 */
public final class Passwords {

    private Passwords() {}

    public static boolean matches(String plain, String hash) {
        if (plain == null || hash == null || hash.length() < 4) {
            return false;
        }
        String normalised = hash;
        if (hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
            normalised = "$2a$" + hash.substring(4);
        }
        try {
            return BCrypt.checkpw(plain, normalised);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static String hash(String plain) {
        return BCrypt.hashpw(plain, BCrypt.gensalt(10));
    }
}
