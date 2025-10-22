import React, { useState, useEffect } from 'react';
import { myAxios } from '../contexts/MyAxios';



export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    

    useEffect(() => {
        // Laravel CSRF cookie inicializálása
        myAxios.get('/sanctum/csrf-cookie')
          
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const emailRegex = /^(?=.*\..{2,}).+$/;     // kell benne lennie egy pontnak, és utánna kötelező 2 karakter, a többit ellenorzi a form
        if (!emailRegex.test(email)) {
            alert("Kérlek, adj meg egy érvényes email címet!\nLegyen a végén pont és 2 karakter utánna!");
            return;
        }
        try {
            const response = await myAxios.post('/api/forgot-password', { email });
            setMessage(response.data.message);
        } catch (error) {
            if (error.response?.data?.message) {
                setMessage(error.response.data.message);
            } else {
                setMessage('Hiba történt a kérés feldolgozása közben.');
            }
        }
    };

    return (
        <div className="loginpage d-flex justify-content-center align-items-center vh-100">
            <div className="login-container p-4 rounded shado bg-light">
                <h2 className="text-center">Elfelejtett jelszó</h2>
                <p id="forgotText">Küldünk egy emailt, ami segít helyreállítani a jelszót.</p>
                <br />
                <form id="forgotpasswordForm" onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                        <input 
                            type="email" 
                            id="email" 
                            className="form-control" 
                            placeholder="Email cím"  
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="actions text-center">
                        <button type="submit" className="btn btn-primary w-100">Küldés</button>
                    </div>
                </form>
                {message && <p className="text-center mt-3 elfelejtettValasz">{message}</p>}    
                <div className="links text-center mt-3">
                    <p>Nem érkezett meg?</p>
                    <p className='varakozoSzoveg'>Várj 5 percet és próbálkozz újra.</p>
                    {/*<a href="#" className="d-block">Email újraküldése</a>*/}
                </div>
            </div>
        </div>
    );
}