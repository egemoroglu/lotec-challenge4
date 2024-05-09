import axios, {AxiosResponse} from 'axios';
import {test, runTests, expect} from 'vitest';

const baseUrl: string = 'http://localhost:3000';


test('Signup API', async () => {
    const response: AxiosResponse = await axios.post(`${baseUrl}/signup`, {
        username: 'testuser',
        password: 'testpassword',
        });
    
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('User successfully signed up');
})

test('Signin API', async () => {
    const response: AxiosResponse = await axios.post(`${baseUrl}/signin`, {
        username: 'testuser',
        password: 'testpassword',
        });
    
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('User successfully signed in');
})

runTests();