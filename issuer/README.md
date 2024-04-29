# OIDC Issuer


openid-credential-offer://?credential_offer=%7B%22grants%22%3A%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%22n2FBE1wbWdXayaEqww8EAp%22%2C%22user_pin_required%22%3Afalse%7D%7D%2C%22credentials%22%3A%5B%22DIIPv2%22%5D%2C%22credential_issuer%22%3A%22http%3A%2F%2F192.168.1.45%3A5003%22%7D

openid-credential-offer://?credential_offer=%7B%22grants%22%3A%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%22bYXJXzyTrX6o4tmgC8EnMZ%22%2C%22user_pin_required%22%3Afalse%7D%7D%2C%22credentials%22%3A%5B%22DIIPv2%22%5D%2C%22credential_issuer%22%3A%22https%3A%2F%2Fssi.sphereon.com%2Fsphereon2023%22%7D

openid-credential-offer://?credential_offer=%7B%22grants%22%3A%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%2262377a95-ea3e-4a4a-8d86-714d2f8d10f1%22%2C%22user_pin_required%22%3Afalse%7D%7D%2C%22credentials%22%3A%5B%22EmailVerifiedCredential%22%5D%2C%22credential_issuer%22%3A%22https%3A%2F%2F192.168.1.45%3A3000%22%7D


openid-credential-offer://?credential_offer={"grants":{"urn:ietf:params:oauth:grant-type:pre-authorized_code":{"pre-authorized_code":"n2FBE1wbWdXayaEqww8EAp","user_pin_required":false}},"credentials":["DIIPv2"],"credential_issuer":"http://192.168.1.45:5003"}

openid-credential-offer://?credential_offer={"grants":{"urn:ietf:params:oauth:grant-type:pre-authorized_code":{"pre-authorized_code":"bYXJXzyTrX6o4tmgC8EnMZ","user_pin_required":false}},"credentials":["DIIPv2"],"credential_issuer":"https://ssi.sphereon.com/sphereon2023"}

openid-credential-offer://?credential_offer={"grants":{"urn:ietf:params:oauth:grant-type:pre-authorized_code":{"pre-authorized_code":"62377a95-ea3e-4a4a-8d86-714d2f8d10f1","user_pin_required":false}},"credentials":["EmailVerifiedCredential"],"credential_issuer":"https://192.168.1.45:3000"}

https://aboutssl.org/how-to-create-and-import-self-signed-certificate-to-android-device/

1. openssl genrsa -out cert.key 2048
2. openssl req -new -days 3650 -key cert.key -out CA.pem
3. openssl x509 -req -days 3650 -in CA.pem -signkey cert.key -extfile ./android_options.txt -out CA.crt
4. openssl x509 -inform PEM -outform DER -in CA.crt -out CA.der.crt
5. npx local-ssl-proxy --key cert-key.pem --cert cert.pem --source 3001 --target 3000


openssl x509 -days 3650 -in CA.pem -signkey cert.key -extfile ./android_options.txt -out CA.crt