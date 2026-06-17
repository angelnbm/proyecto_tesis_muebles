# Pruebas de Caja Negra — HU01: Autenticación

**Historia de usuario:** Como usuario quiero iniciar sesión en el sistema.

**Objetivo específico relacionado:** OE general — acceso al sistema.

**Módulo:** Login / Registro

---

| ID      | Descripción                                      | Entrada                                                                    | Salida esperada                                              | Resultado |
|---------|--------------------------------------------------|----------------------------------------------------------------------------|--------------------------------------------------------------|-----------|
| PCN-01  | Login con credenciales válidas                   | email: `testverify@gmail.com`, contraseña: `Test1234!`                     | Inicio de sesión exitoso, token JWT, redirige al dashboard   |           |
| PCN-02  | Login con contraseña incorrecta                  | email: `testverify@gmail.com`, contraseña: `wrongpass`                     | Error 401, mensaje "Credenciales incorrectas"                |           |
| PCN-03  | Login con email no registrado                    | email: `noexiste@mail.com`, contraseña: `cualquier`                        | Error 401, mensaje "Credenciales incorrectas"                |           |
| PCN-04  | Login con email con formato inválido             | email: `noesun@email`, contraseña: `Test1234!`                             | Error de validación, mensaje "Email inválido"                |           |
| PCN-05  | Login con campos vacíos                          | email: `""`, contraseña: `""`                                              | Error de validación, mensaje campos requeridos               |           |
| PCN-06  | Registro con datos válidos                       | nombre: `Juan`, email: `nuevo@test.com`, contraseña: `Nuevo123!`           | Registro exitoso, token JWT, redirige al dashboard           |           |
| PCN-07  | Registro con email ya registrado                 | nombre: `Test`, email: `testverify@gmail.com`, contraseña: `Test1234!`     | Error 400, mensaje "El email ya está registrado"             |           |
| PCN-08  | Registro con contraseña menor a 6 caracteres     | nombre: `Test`, email: `test2@test.com`, contraseña: `abc`                 | Error 400, mensaje mínimo de caracteres                      |           |
| PCN-09  | Registro sin nombre                              | nombre: `""`, email: `test3@test.com`, contraseña: `Test1234!`             | Error 400, mensaje campos requeridos                         |           |
| PCN-10  | Verificar que la sesión persiste al recargar     | Usuario autenticado recarga la página (F5)                                 | Sigue autenticado, dashboard visible                         |           |
| PCN-11  | Cerrar sesión                                    | Usuario autenticado hace clic en "Cerrar sesión"                           | Token eliminado, redirige al login                           |           |
