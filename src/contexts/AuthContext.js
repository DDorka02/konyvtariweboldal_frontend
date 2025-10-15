import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { myAxios } from "./MyAxios";

export const AuthContext = createContext("");

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [userProfilePic, setUserProfilePic] = useState(localStorage.getItem("userProfilePic") || "https://www.w3schools.com/howto/img_avatar.png");

  // CSRF cookie megszerzése
  const csrf = async () => {
    await myAxios.get("/sanctum/csrf-cookie");
  };

  // Regisztráció
  const regisztracio = async ({ nev, email, password, telefon, varos, cim }) => {
    await csrf();
    try {
      await myAxios.post("/api/userAdd", {
        nev: nev,
        email: email,
        password: password,
        telefon: telefon,
        varos: varos,
        cim: cim,
        szerep: 'felhasznalo' // Alapértelmezett szerep
      });
      navigate("/bejelentkezes");
    } catch (error) {
      console.log(
        "Regisztrációs hiba:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Bejelentkezés
  // Bejelentkezés - JAVÍTOTT VERZIÓ
const login = async ({ email, password }) => {
  await csrf();
  try {
    const response = await myAxios.post("/api/login", {
      email: email,
      password: password,
    });

    console.log("Login response:", response.data); // Debug

    if (response.data && response.data.user && response.data.token) {
      const { user, token } = response.data;
      
      // ✅ TOKEN MENTÉSE localStorage-ba
      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      setUser(user);
      setIsLoggedIn(true);
      setToken(token); // Állapot frissítése

      console.log("Token elmentve:", token); // Debug

      navigate("/konyv");
    } else {
      console.error("Hiányzó user vagy token a válaszban");
      throw new Error("Sikertelen bejelentkezés");
    }
  } catch (error) {
    console.log("Bejelentkezési hiba:", error);
    throw error;
  }
};

  // Felhasználó adatainak lekérése
  const getUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setUser(null);
      setUserProfilePic(null);
      return;
    }
  
    try {
    const response = await myAxios.get("/api/user");
    
    if (!response.data) {
      console.error("Hibás API válasz, nincs user adat.");
      setUser(null);
      return;
    }

    setUser(response.data);
    localStorage.setItem("user", JSON.stringify(response.data));
    
  } catch (error) {
    console.error("Felhasználó lekérdezési hiba:", error);
    logout();
  }
  };

  // Felhasználó adatainak frissítése
  const updateUserData = async () => {
    try {
      const response = await myAxios.get("/api/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.data) {
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Hiba a felhasználói adatok frissítésekor:", error);
    }
  };

  // Kijelentkezés
  const logout = async () => {
    await csrf();
    try {
      await myAxios.post("/api/logout");
    } catch (error) {
      console.log(error);
    } finally {
      setUser(null);
      setUserProfilePic(null);
      setIsLoggedIn(false);
      
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
  
      console.log("Logout sikeres, minden adat törölve.");
      navigate("/bejelentkezes");
    }
  };

  // Profilkép frissítése
  const updateProfilePic = (newProfilePic) => {
    setUserProfilePic(newProfilePic);
    localStorage.setItem("userProfilePic", newProfilePic);
  };

  // Fájl feltöltése és base64-re konvertálás
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        updateProfilePic(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  // Felhasználó könyveinek lekérése
  const getMyBooks = async () => {
    try {
      const response = await myAxios.get("/api/felhasznaloKonyvek", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Hiba a könyvek lekérdezésekor:", error);
      throw error;
    }
  };

  // Új könyv hozzáadása
  const addBook = async (bookData) => {
    try {
      const formData = new FormData();
      Object.keys(bookData).forEach(key => {
        formData.append(key, bookData[key]);
      });

      const response = await myAxios.post("/api/konyvAdd", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Hiba a könyv hozzáadásakor:", error);
      throw error;
    }
  };

  // Könyv keresés hozzáadása
  const addBookSearch = async (konyvId) => {
    try {
      const response = await myAxios.post("/api/konyvKeresesAdd", {
        konyv_id: konyvId
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Hiba a könyvkeresés hozzáadásakor:", error);
      throw error;
    }
  };

  // Csere ajánlat küldése
  const sendExchangeOffer = async (exchangeData) => {
    try {
      const response = await myAxios.post("/api/csereAdd", exchangeData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Hiba a csere ajánlat küldésekor:", error);
      throw error;
    }
  };

  // Alkalmazás indításakor ellenőrizzük, hogy érvényes-e a token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
      getUser(); // Frissítsük a felhasználói adatokat
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }

    // Profilkép beállítása, ha van elmentett
    const storedProfilePic = localStorage.getItem("userProfilePic");
    setUserProfilePic(storedProfilePic || "https://www.w3schools.com/howto/img_avatar.png");
  }, []);

  useEffect(() => {
    console.log("AuthContext user:", user);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        // Alap authentication
        getUser,
        isLoggedIn,
        regisztracio,
        login,
        user,
        logout,
        userProfilePic,
        updateProfilePic,
        handleFileUpload,
        updateUserData,
        
        // Könyvcsere specifikus funkciók
        getMyBooks,
        addBook,
        addBookSearch,
        sendExchangeOffer,
        
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}