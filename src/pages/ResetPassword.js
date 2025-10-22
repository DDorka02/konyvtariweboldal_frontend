import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import "./Layout.css";
import { useEffect } from 'react';
import { myAxios } from '../contexts/MyAxios';




const ResetPassword = () => {
    
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token'); // Get token from query instead

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');


    const navigate = useNavigate();



    useEffect(() => {
        myAxios.get('/sanctum/csrf-cookie')
            
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Submitting with:', {
            token,
            email,
            newPassword,
            confirmPassword
        });

        if (newPassword.length < 8) {
            alert("A jelszónak legalább 8 karakter hosszúnak kell lennie!");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("A két jelszó nem egyezik!");
            return;
        }



        try {
            const response = await myAxios.post('/api/reset-password', {
                token: token,
                email: email,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setMessage(response.data.message);
  
            alert("Új jelszó sikeresen beállítva.");
            navigate("/");
        } catch (error) {
            setMessage(error.response?.data?.message || 'Hiba történt.');

            alert(`Hiba történt: ${error.response?.data?.message || "Ismeretlen hiba."}`);  
        }
    };

    return (
        <div className="resetpasswordpage">
            <article>
                <h2 className="cim">Jelszó visszaállítása</h2>
                <span>Email:  {email}</span>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Új jelszó"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="form-control" 
                        />
                        <br />
                        <input
                            type="password"
                            placeholder="Jelszó megerősítése"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <br />
                        <button id="resetBtn" type="submit">Jelszó visszaállítása</button>
                    </div>
                </form>
                {message && <p>{message}</p>}
            </article>

        </div>
    );
};

export default ResetPassword;