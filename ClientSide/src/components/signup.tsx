import React, {useState} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
export const SignUpPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSignUp = async () => {
        try {
            const response = await axios.post("https://xr2tx2mgwj.us-east-1.awsapprunner.com/signup", {
                username,
                password
            });
            alert("User successfully signed up")
            console.log(response.data);
        } catch (error) {
            alert("User Already Exists")
        }
        setUsername("");
        setPassword("");
    };

    return(
        <div className='signup-div'>
            <h1>Sign Up</h1>
            <input
                type="text"
                className='username-input'
                placeholder="Username"
                required={true}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className='password-input'
                value={password}
                required={true}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className='signup-btn' onClick={handleSignUp}>Sign Up</button>
            {/**If the user already have an account link to signin page */}
            <Link to="/signin">Already have an account? Sign in</Link>
        </div>

    )
}