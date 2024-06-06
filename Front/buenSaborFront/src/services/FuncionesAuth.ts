import Usuario, { UsuarioLogin } from "../models/Usuario";

// ---------- LOGIN ----------------------
export async function login(usuarioLogin?: UsuarioLogin) {
    const endpoint = 'http://localhost:8080/auth/login';

    const response = await fetch(endpoint, {
        "method": "POST",
        "headers": {
            "Content-Type": 'application/json'
        },
        "body": JSON.stringify(usuarioLogin)
    });

    console.log(response);
    const json = await response.json();
    return json as Usuario;
}

// ---------- REGISTER ------------------------
export async function register(usuario: Usuario) {
    const endpoint = 'http://localhost:8080/auth/register';

    try {
        const response = await fetch(endpoint, {
            "method": "POST",
            "headers": {
                "Content-Type": 'application/json'
            },
            "body": JSON.stringify(usuario)
        });
    
        //const json = response.json();
        console.log(response);
        return response;
    } catch (error) {
        throw new Error('Error al guardar el usuario')
    }
}


// -------------- LOG OUT ----------------


export async function logout() { 
    const endpoint = 'http://localhost:8080/auth/logout';

    try {
        const response = await fetch(endpoint, {
            "method": "POST",
            "headers": {
                "Content-Type": 'application/json'
            }
        });
    
        //const json = response.json();
        console.log(response);
        return response;
    } catch (error) {
        throw new Error('Error al guardar el usuario')
    }
}