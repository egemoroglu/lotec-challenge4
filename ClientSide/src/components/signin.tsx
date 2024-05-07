import React, {useState} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom'
export const SignInPage: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            const response = await axios.post("https://xr2tx2mgwj.us-east-1.awsapprunner.com/signin", {
                username,
                password
            });
            console.log(response.data);
            console.log("Sending the request");
            navigate("/todos", {state: {username: username}});
               
        } catch (error) {
            alert('Error: User cannot be signed in')
        }
        setUsername("");
        setPassword("");
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