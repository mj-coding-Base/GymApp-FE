import { useState, useCallback, useEffect } from "react";

interface Credentials {
  email: string;
  password: string;
}

export function useSecureCredentials() {
  const [isRemembered, setIsRemembered] = useState(false);

  const generateEncryptionKey = useCallback(async (): Promise<CryptoKey> => {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }, []);

  const encryptData = useCallback(
    async (data: string, key: CryptoKey): Promise<string> => {
      const encodedData = new TextEncoder().encode(data);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encodedData
      );

      const encryptedArray = new Uint8Array(encryptedData);

      return btoa(String.fromCharCode.apply(null, [...iv, ...encryptedArray]));
    },
    []
  );

  const decryptData = useCallback(
    async (encryptedData: string, key: CryptoKey): Promise<string> => {
      const decodedData = Uint8Array.from(atob(encryptedData), (c) =>
        c.charCodeAt(0)
      );

      const iv = decodedData.slice(0, 12);
      const data = decodedData.slice(12);

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        data
      );

      return new TextDecoder().decode(decryptedData);
    },
    []
  );

  const saveCredentials = useCallback(
    async (credentials: Credentials) => {
      try {
        const key = await generateEncryptionKey();
        const keyString = await window.crypto.subtle.exportKey("raw", key);

        const keyBase64 = btoa(
          String.fromCharCode.apply(null, Array.from(new Uint8Array(keyString)))
        );

        sessionStorage.setItem("encryptionKey", keyBase64);

        const encryptedEmail = await encryptData(credentials.email, key);
        const encryptedPassword = await encryptData(credentials.password, key);

        localStorage.setItem("rememberedEmail", encryptedEmail);
        localStorage.setItem("rememberedPassword", encryptedPassword);
        localStorage.setItem("isRemembered", "true");
        setIsRemembered(true);
      } catch (error) {
        console.error("Error saving credentials:", error);
        throw new Error("Failed to save credentials");
      }
    },
    [generateEncryptionKey, encryptData]
  );

  const loadCredentials = useCallback(async (): Promise<Credentials | null> => {
    try {
      const keyBase64 = sessionStorage.getItem("encryptionKey");

      if (!keyBase64) return null;

      const keyBuffer = Uint8Array.from(atob(keyBase64), (c) =>
        c.charCodeAt(0)
      );

      const key = await window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const encryptedEmail = localStorage.getItem("rememberedEmail");
      const encryptedPassword = localStorage.getItem("rememberedPassword");

      if (!encryptedEmail || !encryptedPassword) return null;

      const email = await decryptData(encryptedEmail, key);
      const password = await decryptData(encryptedPassword, key);

      return { email, password };
    } catch (error) {
      console.error("Error loading credentials:", error);

      return null;
    }
  }, [decryptData]);

  const clearCredentials = useCallback(() => {
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("rememberedPassword");
    localStorage.removeItem("isRemembered");
    sessionStorage.removeItem("encryptionKey");
    setIsRemembered(false);
  }, []);

  useEffect(() => {
    const checkRememberedStatus = () => {
      const remembered = localStorage.getItem("isRemembered");

      setIsRemembered(remembered === "true");
    };

    checkRememberedStatus();
  }, []);

  return {
    isRemembered,
    setIsRemembered,
    saveCredentials,
    loadCredentials,
    clearCredentials,
  };
}
