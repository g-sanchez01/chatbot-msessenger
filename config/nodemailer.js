import nodemailer from 'nodemailer' // Esta librería es la que habla el protocolo SMTP (Simple Mail Transfer Protocol). SMTP es el idioma estándar que usan los servidores para enviarse correos entre sí

/* host → El servidor SMTP (ej: smtp.gmail.com, smtp.office365.com)
port → El puerto (587 normalmente para TLS, 465 para SSL)
user → El correo que enviará
pass → La contraseña o contraseña de aplicación*/

export function createTransport(host, port, user, pass){
    return nodemailer.createTransport({
        host: host,
        port: port,
        secure: false,
        auth: {
            user: user,
            pass: pass
        }
    })
}
    