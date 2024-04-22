import React, {useState} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
export const SignInPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignIn = async () => {
        console.log("Sign in button clicked");
        try {
            const response = await axios.post("/signin", {
                username,
                password
            });
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return(
        <div className='signin-div'>
            <h1>Sign In</h1>
            <input
                type="text"
                className='username-input'
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className='password-input'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className='signup-btn' onClick={handleSignIn}>Sign In</button>
            {/**If the user already have an account link to signin page */}
            <Link to="/">Don't have an account? Sign up</Link>
        </div>

    )
}