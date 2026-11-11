export default {
    async fetch(request, env) {
        const rawUsers = env.AUTH_USERS;

        if (!rawUsers) {
            return new Response("Server Auth Configuration Missing", {
                status: 500,
            });
        }

        let USERS = {};
        try {
            USERS = JSON.parse(rawUsers);
        } catch (e) {
            return new Response("Invalid AUTH_USERS JSON format", {
                status: 500,
            });
        }

        const authHeader = request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Basic ")) {
            return new Response("Authentication Required", {
                status: 401,
                headers: {
                    "WWW-Authenticate":
                        'Basic realm="Secure Area", charset="UTF-8"',
                },
            });
        }

        try {
            const base64Credentials = authHeader.split(" ")[1];
            const credentials = atob(base64Credentials);
            const colonIndex = credentials.indexOf(":");
            const username = credentials.slice(0, colonIndex);
            const password = credentials.slice(colonIndex + 1);

            if (
                Object.prototype.hasOwnProperty.call(USERS, username) &&
                USERS[username] === password
            ) {
                // لو اليوزر والباسورد صح، يعرض ملفات الـ HTML
                return await env.ASSETS.fetch(request);
            }
        } catch (err) {}

        return new Response("Invalid username or password", {
            status: 401,
            headers: {
                "WWW-Authenticate":
                    'Basic realm="Secure Area", charset="UTF-8"',
            },
        });
    },
};
